import itertools

import pytest

from core.jogo.explicacoes import EXPLICACOES, obter_explicacao
from core.jogo.perguntas import CAMADAS, ESTRUTURAS


def test_explicacoes_cobrem_todas_combinacoes():
    assert set(EXPLICACOES.keys()) == set(itertools.product(ESTRUTURAS, CAMADAS))


def test_cada_entrada_tem_variantes_acertou_e_errou():
    for chave, variantes in EXPLICACOES.items():
        assert set(variantes.keys()) == {"acertou", "errou"}, chave


def test_cada_texto_entre_100_e_400_chars():
    for chave, variantes in EXPLICACOES.items():
        for nome, texto in variantes.items():
            assert 100 <= len(texto) <= 400, f"{chave}/{nome}: tamanho {len(texto)}"


def test_explicacoes_nao_tem_placeholders():
    marcadores = ["TODO", "FIXME", "NEEDS CLARIFICATION", "XXX"]
    for chave, variantes in EXPLICACOES.items():
        for nome, texto in variantes.items():
            for m in marcadores:
                assert m not in texto, f"placeholder {m} em {chave}/{nome}"


def test_obter_explicacao_devolve_variante_correta():
    acerto = obter_explicacao("heap", "estrutura", True)
    erro = obter_explicacao("heap", "estrutura", False)
    assert acerto == EXPLICACOES[("heap", "estrutura")]["acertou"]
    assert erro == EXPLICACOES[("heap", "estrutura")]["errou"]
    assert acerto != erro


def test_obter_explicacao_rejeita_chave_desconhecida():
    with pytest.raises(KeyError):
        obter_explicacao("foo", "estrutura", True)
