import json
import time

import pytest
from django.conf import settings
from django.test import Client

from core.jogo import token
from core.jogo.neutralidade import varredura_neutra, varredura_neutra_texto
from core.jogo.operacoes import OPERACOES
from core.jogo.sortear import gerar_rodada


@pytest.fixture
def client() -> Client:
    return Client()


def _secret() -> bytes:
    return settings.SECRET_KEY.encode("utf-8")


# -------- /rodada --------


def test_rodada_response_tem_token_e_passos(client: Client) -> None:
    res = client.get("/api/jogo_adivinhe/rodada")
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert "." in data["token"]
    assert isinstance(data["passos"], list)
    assert len(data["passos"]) >= 2


def test_rodada_response_inclui_pergunta_estrutura(client: Client) -> None:
    res = client.get("/api/jogo_adivinhe/rodada?seed=42")
    assert res.status_code == 200
    data = res.json()
    assert "pergunta_estrutura" in data
    p = data["pergunta_estrutura"]
    assert p["camada"] == "estrutura"
    assert isinstance(p["enunciado"], str) and p["enunciado"].strip()
    assert isinstance(p["alternativas"], list)
    assert len(p["alternativas"]) == 4
    assert all(isinstance(a, str) for a in p["alternativas"])
    assert "indice_correto" not in p


def test_rodada_com_seed_eh_reproduzivel(client: Client) -> None:
    r1 = client.get("/api/jogo_adivinhe/rodada?seed=42").json()
    r2 = client.get("/api/jogo_adivinhe/rodada?seed=42").json()
    assert r1["passos"] == r2["passos"]
    assert r1["pergunta_estrutura"] == r2["pergunta_estrutura"]


def test_rodada_seed_invalido_retorna_400(client: Client) -> None:
    assert client.get("/api/jogo_adivinhe/rodada?seed=-1").status_code == 400
    assert client.get("/api/jogo_adivinhe/rodada?seed=abc").status_code == 400


def test_rodada_passos_minimo_2(client: Client) -> None:
    for seed in range(20):
        res = client.get(f"/api/jogo_adivinhe/rodada?seed={seed}")
        assert res.status_code == 200
        assert len(res.json()["passos"]) >= 2


def test_rodada_sem_vazamento_de_nome(client: Client) -> None:
    for seed in range(50):
        res = client.get(f"/api/jogo_adivinhe/rodada?seed={seed}")
        assert res.status_code == 200
        data = res.json()
        varredura_neutra(data["passos"])
        varredura_neutra_texto(data["pergunta_estrutura"]["enunciado"])


# -------- /palpite --------


def _rodada_contexto(client: Client, seed: int):
    res = client.get(f"/api/jogo_adivinhe/rodada?seed={seed}")
    assert res.status_code == 200
    data = res.json()
    interna = gerar_rodada(seed)
    return data["token"], interna


def _palpite(client: Client, payload: dict):
    return client.post(
        "/api/jogo_adivinhe/palpite",
        data=json.dumps(payload),
        content_type="application/json",
    )


def test_palpite_estagio_estrutura_acerto_devolve_proxima_pergunta_operacao(
    client: Client,
) -> None:
    tok, interna = _rodada_contexto(client, seed=1)
    correto = interna.pergunta_estrutura.alternativas[
        interna.pergunta_estrutura.indice_correto
    ]
    res = _palpite(client, {"token": tok, "estagio": "estrutura", "palpite": correto})
    assert res.status_code == 200
    data = res.json()
    assert data["camada"] == "estrutura"
    assert data["acertou"] is True
    assert data["correto"] == correto
    assert data["explicacao"].strip()
    assert data["proxima_pergunta"]["camada"] == "operacao"
    assert len(data["proxima_pergunta"]["alternativas"]) == 4
    assert "indice_correto" not in data["proxima_pergunta"]


def test_palpite_estagio_estrutura_erro_tambem_devolve_proxima_pergunta(
    client: Client,
) -> None:
    tok, interna = _rodada_contexto(client, seed=2)
    correto = interna.pergunta_estrutura.alternativas[
        interna.pergunta_estrutura.indice_correto
    ]
    errado = next(
        a for a in interna.pergunta_estrutura.alternativas if a != correto
    )
    res = _palpite(client, {"token": tok, "estagio": "estrutura", "palpite": errado})
    assert res.status_code == 200
    data = res.json()
    assert data["acertou"] is False
    assert data["correto"] == correto
    assert data["proxima_pergunta"]["camada"] == "operacao"


def test_palpite_estagio_operacao_devolve_proxima_pergunta_complexidade(
    client: Client,
) -> None:
    tok, interna = _rodada_contexto(client, seed=3)
    correto = interna.pergunta_operacao.alternativas[
        interna.pergunta_operacao.indice_correto
    ]
    res = _palpite(client, {"token": tok, "estagio": "operacao", "palpite": correto})
    assert res.status_code == 200
    data = res.json()
    assert data["camada"] == "operacao"
    assert data["proxima_pergunta"]["camada"] == "complexidade"


def test_palpite_estagio_complexidade_devolve_proxima_pergunta_null(
    client: Client,
) -> None:
    tok, interna = _rodada_contexto(client, seed=4)
    correto = interna.pergunta_complexidade.alternativas[
        interna.pergunta_complexidade.indice_correto
    ]
    res = _palpite(
        client, {"token": tok, "estagio": "complexidade", "palpite": correto}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["camada"] == "complexidade"
    assert data["acertou"] is True
    assert data["proxima_pergunta"] is None


def test_palpite_estagio_invalido_retorna_400(client: Client) -> None:
    tok, _ = _rodada_contexto(client, seed=5)
    res = _palpite(client, {"token": tok, "estagio": "foo", "palpite": "x"})
    assert res.status_code == 400


def test_palpite_palpite_fora_das_alternativas_retorna_400(client: Client) -> None:
    tok, _ = _rodada_contexto(client, seed=6)
    res = _palpite(
        client,
        {"token": tok, "estagio": "estrutura", "palpite": "xyz-fora-das-alternativas"},
    )
    assert res.status_code == 400


def test_palpite_token_adulterado_retorna_401(client: Client) -> None:
    tok, _ = _rodada_contexto(client, seed=7)
    adulterado = tok[:-1] + ("A" if tok[-1] != "A" else "B")
    res = _palpite(
        client, {"token": adulterado, "estagio": "estrutura", "palpite": "x"}
    )
    assert res.status_code == 401


def test_palpite_token_expirado_retorna_404(client: Client) -> None:
    op_nome = OPERACOES["pilha"][0].nome
    claims_antigas = {
        "e": "pilha",
        "op": op_nome,
        "s": 1,
        "t": int(time.time()) - 7200,
    }
    tok_antigo = token.encode(claims_antigas, _secret())
    res = _palpite(
        client, {"token": tok_antigo, "estagio": "estrutura", "palpite": "x"}
    )
    assert res.status_code == 404


def test_palpite_para_mesmo_token_estagio_eh_idempotente(client: Client) -> None:
    tok, interna = _rodada_contexto(client, seed=8)
    correto = interna.pergunta_estrutura.alternativas[
        interna.pergunta_estrutura.indice_correto
    ]
    payload = {"token": tok, "estagio": "estrutura", "palpite": correto}
    r1 = _palpite(client, payload).json()
    r2 = _palpite(client, payload).json()
    r3 = _palpite(client, payload).json()
    assert r1 == r2 == r3
