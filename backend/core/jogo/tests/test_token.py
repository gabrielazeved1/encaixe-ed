import time

import pytest

from core.jogo import token


SECRET = b"test-secret-key"


def _agora() -> int:
    return int(time.time())


def test_roundtrip_encode_decode_preserva_claims():
    claims = {"e": "heap", "op": "push_sift", "s": 42, "t": 1000}
    s = token.encode(claims, SECRET)
    out = token.decode(s, SECRET, agora=1000)
    assert out == claims


def test_decode_rejeita_assinatura_adulterada():
    claims = {"e": "pilha", "op": "push_pop", "s": 1, "t": _agora()}
    s = token.encode(claims, SECRET)
    adulterado = s[:-1] + ("A" if s[-1] != "A" else "B")
    with pytest.raises(token.TokenInvalido):
        token.decode(adulterado, SECRET, agora=_agora())


def test_decode_rejeita_timestamp_expirado():
    claims = {"e": "pilha", "op": "push_pop", "s": 1, "t": 1000}
    s = token.encode(claims, SECRET)
    with pytest.raises(token.TokenExpirado):
        token.decode(s, SECRET, agora=1000 + token.TTL_SEGUNDOS + 100)


def test_decode_aceita_dentro_da_janela():
    claims = {"e": "fila", "op": "enqueue_dequeue", "s": 7, "t": 1000}
    s = token.encode(claims, SECRET)
    out = token.decode(s, SECRET, agora=1000 + token.TTL_SEGUNDOS - 1)
    assert out["e"] == "fila"


def test_decode_rejeita_payload_sem_ponto():
    with pytest.raises(token.TokenInvalido):
        token.decode("semponto", SECRET, agora=0)


def test_decode_rejeita_payload_base64_invalido():
    with pytest.raises(token.TokenInvalido):
        token.decode("!!!.!!!", SECRET, agora=0)


def test_decode_rejeita_json_invalido():
    import base64

    payload = base64.urlsafe_b64encode(b"not json").rstrip(b"=").decode()
    sig = base64.urlsafe_b64encode(b"a" * 32).rstrip(b"=").decode()
    with pytest.raises(token.TokenInvalido):
        token.decode(f"{payload}.{sig}", SECRET, agora=0)


def test_decode_rejeita_estrutura_desconhecida():
    claims_falsas = {"e": "treap", "op": "push_pop", "s": 1, "t": _agora()}
    s = token.encode(claims_falsas, SECRET)
    with pytest.raises(token.TokenInvalido):
        token.decode(s, SECRET, agora=_agora())


def test_decode_rejeita_claims_sem_op():
    claims = {"e": "pilha", "s": 1, "t": _agora()}
    s = token.encode(claims, SECRET)  # type: ignore[arg-type]
    with pytest.raises(token.TokenInvalido):
        token.decode(s, SECRET, agora=_agora())


def test_decode_rejeita_op_desconhecida_para_estrutura():
    claims = {"e": "heap", "op": "xyz", "s": 0, "t": _agora()}
    s = token.encode(claims, SECRET)
    with pytest.raises(token.TokenInvalido):
        token.decode(s, SECRET, agora=_agora())


def test_decode_rejeita_op_de_outra_estrutura():
    claims = {"e": "heap", "op": "push_pop", "s": 0, "t": _agora()}
    s = token.encode(claims, SECRET)
    with pytest.raises(token.TokenInvalido):
        token.decode(s, SECRET, agora=_agora())


def test_encode_decode_usa_agora_padrao_quando_omitido():
    claims = {"e": "hash", "op": "inserir_colidir_buscar", "s": 1, "t": _agora()}
    s = token.encode(claims, SECRET)
    out = token.decode(s, SECRET)
    assert out == claims
