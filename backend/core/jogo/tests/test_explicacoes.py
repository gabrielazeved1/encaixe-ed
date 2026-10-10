from core.jogo.explicacoes import EXPLICACOES
from core.jogo.token import ESTRUTURAS_VALIDAS


def test_7_estruturas_tem_explicacao():
    assert set(EXPLICACOES.keys()) == ESTRUTURAS_VALIDAS


def test_explicacoes_nao_tem_placeholders():
    marcadores = ["TODO", "FIXME", "NEEDS CLARIFICATION", "XXX"]
    for estrutura, texto in EXPLICACOES.items():
        assert texto.strip(), f"explicação vazia para {estrutura}"
        for m in marcadores:
            assert m not in texto, f"placeholder {m} em {estrutura}"


def test_explicacoes_sao_textos_curtos():
    for estrutura, texto in EXPLICACOES.items():
        assert 20 <= len(texto) <= 400, f"{estrutura}: tamanho {len(texto)}"
