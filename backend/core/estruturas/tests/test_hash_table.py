from core.estruturas.hash_table import HashTable, comparar_busca


def test_inserir_e_buscar() -> None:
    ht = HashTable()
    ht.inserir("nome", "Gabriel")
    valor, _ = ht.buscar("nome")
    assert valor == "Gabriel"


def test_busca_inexistente_retorna_none() -> None:
    ht = HashTable()
    ht.inserir("a", 1)
    valor, _ = ht.buscar("b")
    assert valor is None


def test_comparar_busca_hash_usa_menos_comparacoes() -> None:
    dados = [
        {"chave": f"k{i:03d}", "valor": f"v{i}"} for i in range(20)
    ]
    resultado = comparar_busca(dados, "k015")
    assert resultado["linear"]["encontrado"] is True
    assert resultado["hash"]["encontrado"] is True
    assert resultado["hash"]["comparacoes"] <= resultado["linear"]["comparacoes"]


def test_colisao_resolve_corretamente() -> None:
    ht = HashTable(tamanho=2)
    ht.inserir("aa", 1)
    ht.inserir("bb", 2)
    ht.inserir("cc", 3)
    assert ht.buscar("aa")[0] == 1
    assert ht.buscar("bb")[0] == 2
    assert ht.buscar("cc")[0] == 3
