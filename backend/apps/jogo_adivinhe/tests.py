import json
import time

import pytest
from django.conf import settings
from django.test import Client

from core.jogo import token
from core.jogo.neutralidade import varredura_neutra


@pytest.fixture
def client() -> Client:
    return Client()


def _secret() -> bytes:
    return settings.SECRET_KEY.encode("utf-8")


# -------- /rodada --------


def test_rodada_tem_token_e_passos(client: Client) -> None:
    res = client.get("/api/jogo_adivinhe/rodada")
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert "." in data["token"]
    assert isinstance(data["passos"], list)
    assert len(data["passos"]) >= 2


def test_rodada_seed_fixo_e_reprodutivel(client: Client) -> None:
    r1 = client.get("/api/jogo_adivinhe/rodada?seed=42").json()
    r2 = client.get("/api/jogo_adivinhe/rodada?seed=42").json()
    assert r1["passos"] == r2["passos"]


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
        passos = res.json()["passos"]
        varredura_neutra(passos)


# -------- /palpite --------


def _rodada_e_estrutura(client: Client, seed: int):
    res = client.get(f"/api/jogo_adivinhe/rodada?seed={seed}")
    assert res.status_code == 200
    data = res.json()
    claims = token.decode(data["token"], _secret())
    return data["token"], claims["e"]


def test_palpite_acerto_retorna_acertou_true(client: Client) -> None:
    tok, estrutura = _rodada_e_estrutura(client, seed=1)
    res = client.post(
        "/api/jogo_adivinhe/palpite",
        data=json.dumps({"token": tok, "palpite": estrutura}),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["acertou"] is True
    assert data["estrutura_correta"] == estrutura
    assert data["explicacao"].strip()


def test_palpite_erro_retorna_acertou_false_mas_revela_estrutura(
    client: Client,
) -> None:
    tok, estrutura = _rodada_e_estrutura(client, seed=2)
    outra = next(e for e in token.ESTRUTURAS_VALIDAS if e != estrutura)
    res = client.post(
        "/api/jogo_adivinhe/palpite",
        data=json.dumps({"token": tok, "palpite": outra}),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["acertou"] is False
    assert data["estrutura_correta"] == estrutura


def test_palpite_invalido_retorna_400(client: Client) -> None:
    tok, _ = _rodada_e_estrutura(client, seed=3)
    res = client.post(
        "/api/jogo_adivinhe/palpite",
        data=json.dumps({"token": tok, "palpite": "treap"}),
        content_type="application/json",
    )
    assert res.status_code == 400


def test_palpite_token_adulterado_retorna_401(client: Client) -> None:
    tok, _ = _rodada_e_estrutura(client, seed=4)
    adulterado = tok[:-1] + ("A" if tok[-1] != "A" else "B")
    res = client.post(
        "/api/jogo_adivinhe/palpite",
        data=json.dumps({"token": adulterado, "palpite": "pilha"}),
        content_type="application/json",
    )
    assert res.status_code == 401


def test_palpite_token_expirado_retorna_404(client: Client) -> None:
    claims_antigas = {"e": "pilha", "s": 1, "t": int(time.time()) - 7200}
    tok_antigo = token.encode(claims_antigas, _secret())
    res = client.post(
        "/api/jogo_adivinhe/palpite",
        data=json.dumps({"token": tok_antigo, "palpite": "pilha"}),
        content_type="application/json",
    )
    assert res.status_code == 404


def test_palpite_idempotente(client: Client) -> None:
    tok, estrutura = _rodada_e_estrutura(client, seed=6)
    corpo = json.dumps({"token": tok, "palpite": estrutura})
    r1 = client.post(
        "/api/jogo_adivinhe/palpite", data=corpo, content_type="application/json"
    ).json()
    r2 = client.post(
        "/api/jogo_adivinhe/palpite", data=corpo, content_type="application/json"
    ).json()
    r3 = client.post(
        "/api/jogo_adivinhe/palpite", data=corpo, content_type="application/json"
    ).json()
    assert r1 == r2 == r3
