import pytest

from core.jogo import token
from core.jogo.avaliar import PalpiteInvalido, VereditoParcial, avaliar
from core.jogo.sortear import gerar_rodada, sortear


SECRET = b"test-secret"


def _rodada_contexto(seed: int, agora: int = 1000):
    r = sortear(seed=seed, secret=SECRET, agora=agora)
    interna = gerar_rodada(seed)
    return r, interna


def test_avaliar_estrutura_acerto_devolve_proxima_pergunta_operacao():
    r, interna = _rodada_contexto(seed=1)
    correto = interna.pergunta_estrutura.alternativas[
        interna.pergunta_estrutura.indice_correto
    ]
    v = avaliar(r.token, "estrutura", correto, secret=SECRET, agora=1000)
    assert v.camada == "estrutura"
    assert v.acertou is True
    assert v.correto == correto
    assert v.explicacao.strip()
    assert v.proxima_pergunta is not None
    assert v.proxima_pergunta.camada == "operacao"
    assert len(v.proxima_pergunta.alternativas) == 4


def test_avaliar_estrutura_erro_tambem_devolve_proxima_pergunta():
    r, interna = _rodada_contexto(seed=2)
    correto = interna.pergunta_estrutura.alternativas[
        interna.pergunta_estrutura.indice_correto
    ]
    errado = next(a for a in interna.pergunta_estrutura.alternativas if a != correto)
    v = avaliar(r.token, "estrutura", errado, secret=SECRET, agora=1000)
    assert v.acertou is False
    assert v.correto == correto
    assert v.proxima_pergunta is not None
    assert v.proxima_pergunta.camada == "operacao"


def test_avaliar_operacao_devolve_proxima_pergunta_complexidade():
    r, interna = _rodada_contexto(seed=3)
    correto = interna.pergunta_operacao.alternativas[
        interna.pergunta_operacao.indice_correto
    ]
    v = avaliar(r.token, "operacao", correto, secret=SECRET, agora=1000)
    assert v.camada == "operacao"
    assert v.proxima_pergunta is not None
    assert v.proxima_pergunta.camada == "complexidade"


def test_avaliar_complexidade_devolve_proxima_pergunta_none():
    r, interna = _rodada_contexto(seed=4)
    correto = interna.pergunta_complexidade.alternativas[
        interna.pergunta_complexidade.indice_correto
    ]
    v = avaliar(r.token, "complexidade", correto, secret=SECRET, agora=1000)
    assert v.camada == "complexidade"
    assert v.acertou is True
    assert v.proxima_pergunta is None


def test_avaliar_estagio_invalido_levanta_valueerror():
    r, _ = _rodada_contexto(seed=5)
    with pytest.raises(ValueError):
        avaliar(r.token, "foo", "x", secret=SECRET, agora=1000)


def test_avaliar_palpite_fora_das_alternativas_levanta_palpiteinvalido():
    r, _ = _rodada_contexto(seed=6)
    with pytest.raises(PalpiteInvalido):
        avaliar(r.token, "estrutura", "xyz-invalid", secret=SECRET, agora=1000)


def test_avaliar_eh_deterministico_dada_mesma_seed():
    r, interna = _rodada_contexto(seed=7)
    correto = interna.pergunta_estrutura.alternativas[
        interna.pergunta_estrutura.indice_correto
    ]
    v1 = avaliar(r.token, "estrutura", correto, secret=SECRET, agora=1000)
    v2 = avaliar(r.token, "estrutura", correto, secret=SECRET, agora=1000)
    assert v1 == v2


def test_avaliar_rejeita_token_adulterado():
    r, _ = _rodada_contexto(seed=8)
    adulterado = r.token[:-1] + ("A" if r.token[-1] != "A" else "B")
    with pytest.raises(token.TokenInvalido):
        avaliar(adulterado, "estrutura", "x", secret=SECRET, agora=1000)


def test_avaliar_rejeita_token_expirado():
    r, _ = _rodada_contexto(seed=9, agora=1000)
    with pytest.raises(token.TokenExpirado):
        avaliar(
            r.token,
            "estrutura",
            "x",
            secret=SECRET,
            agora=1000 + token.TTL_SEGUNDOS + 10,
        )


def test_avaliar_retorna_veredito_parcial_instanciado():
    r, interna = _rodada_contexto(seed=10)
    correto = interna.pergunta_estrutura.alternativas[
        interna.pergunta_estrutura.indice_correto
    ]
    v = avaliar(r.token, "estrutura", correto, secret=SECRET, agora=1000)
    assert isinstance(v, VereditoParcial)
