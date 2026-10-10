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


def test_passos_valor_unico_insercao_raiz_mais_busca_igual() -> None:
    r = simular_bst([50], 50)
    passos = r["passos"]
    assert isinstance(passos, list)
    assert len(passos) == 2
    assert "raiz" in passos[0]["descricao"]
    assert "encontrada" in passos[1]["descricao"].lower()


def test_passos_indices_densos_comecam_em_zero() -> None:
    r = simular_bst([50, 30, 70, 40], 40)
    passos = r["passos"]
    assert isinstance(passos, list)
    for i, p in enumerate(passos):
        assert p["indice"] == i


def test_passos_contem_insercoes_e_busca_separadas() -> None:
    r = simular_bst([50, 30, 70, 40], 40)
    passos = r["passos"]
    assert isinstance(passos, list)
    descricoes = [p["descricao"] for p in passos]
    assert any("Inserindo 50" in d or "Inserindo 50 como raiz" in d for d in descricoes)
    assert any("Buscando 40" in d for d in descricoes)
    assert any("encontrada" in d.lower() for d in descricoes)


def test_passos_destaques_referenciam_valores_existentes() -> None:
    r = simular_bst([50, 30, 70], 70)
    passos = r["passos"]
    assert isinstance(passos, list)
    valores_validos = {"no:50", "no:30", "no:70"}
    for p in passos:
        for d in p["destaques"]:
            assert d in valores_validos


def test_simular_bst_mantem_passos_busca_formato_antigo() -> None:
    r = simular_bst([50, 30, 70], 30)
    assert r["passos_busca"] == [
        {"no": 50, "comparacao": "menor"},
        {"no": 30, "comparacao": "igual"},
    ]
