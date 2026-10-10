import pytest

from core.jogo import token
from core.jogo.avaliar import PalpiteInvalido, avaliar
from core.jogo.sortear import sortear


SECRET = b"test-secret"


def _rodada_e_estrutura(seed: int, agora: int = 1000):
    r = sortear(seed=seed, secret=SECRET, agora=agora)
    claims = token.decode(r.token, SECRET, agora=agora)
    return r, claims["e"]


def test_avaliar_acerto_retorna_true_e_explicacao():
    r, estrutura = _rodada_e_estrutura(seed=1)
    v = avaliar(r.token, estrutura, secret=SECRET, agora=1000)
    assert v.acertou is True
    assert v.estrutura_correta == estrutura
    assert v.explicacao.strip()


def test_avaliar_erro_retorna_false_mas_revela_correta():
    r, estrutura = _rodada_e_estrutura(seed=2)
    outra = next(e for e in token.ESTRUTURAS_VALIDAS if e != estrutura)
    v = avaliar(r.token, outra, secret=SECRET, agora=1000)
    assert v.acertou is False
    assert v.estrutura_correta == estrutura
    assert v.explicacao.strip()


def test_avaliar_token_invalido_levanta_TokenInvalido():
    r, _ = _rodada_e_estrutura(seed=3)
    adulterado = r.token[:-1] + ("A" if r.token[-1] != "A" else "B")
    with pytest.raises(token.TokenInvalido):
        avaliar(adulterado, "pilha", secret=SECRET, agora=1000)


def test_avaliar_token_expirado_levanta_TokenExpirado():
    r, _ = _rodada_e_estrutura(seed=4, agora=1000)
    with pytest.raises(token.TokenExpirado):
        avaliar(r.token, "pilha", secret=SECRET, agora=1000 + token.TTL_SEGUNDOS + 10)


def test_avaliar_palpite_fora_da_lista_valida_levanta():
    r, _ = _rodada_e_estrutura(seed=5)
    with pytest.raises(PalpiteInvalido):
        avaliar(r.token, "treap", secret=SECRET, agora=1000)


def test_avaliar_idempotente():
    r, estrutura = _rodada_e_estrutura(seed=6)
    v1 = avaliar(r.token, estrutura, secret=SECRET, agora=1000)
    v2 = avaliar(r.token, estrutura, secret=SECRET, agora=1000)
    v3 = avaliar(r.token, estrutura, secret=SECRET, agora=1000)
    assert v1 == v2 == v3
