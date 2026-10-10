from core.jogo import token
from core.jogo.neutralidade import varredura_neutra_texto
from core.jogo.operacoes import OPERACOES
from core.jogo.sortear import sortear
from core.jogo.token import ESTRUTURAS_VALIDAS


SECRET = b"test-secret"


def test_seed_fixo_produz_rodada_identica():
    r1 = sortear(seed=42, secret=SECRET, agora=1000)
    r2 = sortear(seed=42, secret=SECRET, agora=1000)
    assert r1.token == r2.token
    assert r1.passos == r2.passos
    assert r1.pergunta_estrutura == r2.pergunta_estrutura


def test_sem_seed_sorteia_estruturas_variadas():
    estruturas_vistas: set[str] = set()
    for _ in range(100):
        r = sortear(seed=None, secret=SECRET, agora=1000)
        claims = token.decode(r.token, SECRET, agora=1000)
        estruturas_vistas.add(claims["e"])
    assert len(estruturas_vistas) >= 5


def test_sortear_sempre_retorna_pelo_menos_2_passos():
    for s in range(50):
        r = sortear(seed=s, secret=SECRET, agora=1000)
        assert len(r.passos) >= 2


def test_sortear_token_decodifica_estrutura_valida():
    for s in range(20):
        r = sortear(seed=s, secret=SECRET, agora=1000)
        claims = token.decode(r.token, SECRET, agora=1000)
        assert claims["e"] in ESTRUTURAS_VALIDAS
        assert claims["s"] == s
        assert claims["t"] == 1000


def test_sortear_seed_none_grava_seed_gerada_no_token():
    r = sortear(seed=None, secret=SECRET, agora=2000)
    claims = token.decode(r.token, SECRET, agora=2000)
    assert isinstance(claims["s"], int)
    assert claims["s"] >= 0


def test_rodada_inclui_pergunta_estrutura():
    r = sortear(seed=0, secret=SECRET, agora=1000)
    assert r.pergunta_estrutura.camada == "estrutura"
    assert len(r.pergunta_estrutura.alternativas) == 4


def test_token_da_rodada_contem_op():
    for s in range(20):
        r = sortear(seed=s, secret=SECRET, agora=1000)
        claims = token.decode(r.token, SECRET, agora=1000)
        assert "op" in claims
        ops_validas = {op.nome for op in OPERACOES[claims["e"]]}
        assert claims["op"] in ops_validas


def test_enunciado_pergunta_estrutura_passa_na_varredura_neutra():
    for s in range(30):
        r = sortear(seed=s, secret=SECRET, agora=1000)
        varredura_neutra_texto(r.pergunta_estrutura.enunciado)
