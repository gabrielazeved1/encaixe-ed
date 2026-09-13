import pytest
from core.estruturas.bst import BST, simular_bst


def test_insercao_mantem_propriedade() -> None:
    b = BST()
    for v in [8, 4, 12, 2, 6, 10, 14]:
        b.inserir(v)
    arvore = b.para_dict()
    assert arvore is not None
    assert arvore["valor"] == 8
    esq = arvore["esq"]
    dir_ = arvore["dir"]
    assert isinstance(esq, dict) and esq["valor"] == 4
    assert isinstance(dir_, dict) and dir_["valor"] == 12


def test_busca_encontra_elemento() -> None:
    b = BST()
    for v in [8, 4, 12, 2, 6]:
        b.inserir(v)
    r = b.buscar(6)
    assert r["encontrado"] is True


def test_busca_nao_encontrada() -> None:
    b = BST()
    for v in [8, 4, 12]:
        b.inserir(v)
    r = b.buscar(99)
    assert r["encontrado"] is False


def test_simular_bst_comparacoes_bst_menor_que_linear() -> None:
    r = simular_bst([8, 4, 12, 2, 6, 10, 14], 14)
    assert r["encontrado"] is True
    assert r["comparacoes_bst"] <= r["comparacoes_linear"]


def test_simular_bst_valores_vazios_levanta_excecao() -> None:
    with pytest.raises(ValueError):
        simular_bst([], 5)
