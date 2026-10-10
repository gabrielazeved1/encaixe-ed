import pytest

from core.jogo.complexidade import PIOR_CASO, pior_caso
from core.jogo.operacoes import OPERACOES


def test_pior_caso_cobre_todas_operacoes():
    pares = {(e, op.nome) for e, lista in OPERACOES.items() for op in lista}
    assert set(PIOR_CASO.keys()) == pares


def test_pior_caso_bate_com_metadata_de_operacao():
    for estrutura, lista in OPERACOES.items():
        for op in lista:
            assert PIOR_CASO[(estrutura, op.nome)] == op.complexidade_pior


def test_pior_caso_rejeita_operacao_desconhecida():
    with pytest.raises(KeyError):
        pior_caso("pilha", "foo")


def test_pior_caso_rejeita_estrutura_desconhecida():
    with pytest.raises(KeyError):
        pior_caso("xyz", "push_pop")
