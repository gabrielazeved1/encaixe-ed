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


def test_passos_tabela_vazia_e_insercao_basica() -> None:
    dados = [{"chave": "a", "valor": 1}]
    r = comparar_busca(dados, "a")
    passos = r["passos"]
    assert isinstance(passos, list) and len(passos) >= 1
    assert "Tabela vazia" in passos[0]["descricao"]
    assert passos[0]["destaques"] == []
    estado0 = passos[0]["estado"]
    assert isinstance(estado0, dict)
    assert estado0["tamanho"] == 16
    buckets0 = estado0["buckets"]
    assert isinstance(buckets0, list) and len(buckets0) == 16


def test_passos_descricao_de_colisao() -> None:
    dados = [
        {"chave": "a", "valor": 1},
        {"chave": "q", "valor": 2},
    ]
    r = comparar_busca(dados, "q")
    passos = r["passos"]
    assert isinstance(passos, list)
    descricoes = [p["descricao"] for p in passos]
    assert any("Colisão" in d for d in descricoes)


def test_passos_busca_encontrada_tem_descricao_explicita() -> None:
    dados = [{"chave": "a", "valor": 1}]
    r = comparar_busca(dados, "a")
    passos = r["passos"]
    assert isinstance(passos, list)
    assert any("encontrada" in p["descricao"].lower() for p in passos)


def test_passos_destaques_apontam_para_bucket_valido() -> None:
    dados = [
        {"chave": "a", "valor": 1},
        {"chave": "q", "valor": 2},
    ]
    r = comparar_busca(dados, "q")
    passos = r["passos"]
    assert isinstance(passos, list)
    for p in passos:
        for d in p["destaques"]:
            assert d.startswith("bucket:")
            n = int(d.split(":")[1])
            assert 0 <= n < 16


def test_passos_indices_densos_e_envelope_bem_formado() -> None:
    dados = [{"chave": "nome", "valor": "Gabriel"}]
    r = comparar_busca(dados, "nome")
    passos = r["passos"]
    assert isinstance(passos, list)
    for i, p in enumerate(passos):
        assert p["indice"] == i
        assert set(p.keys()) >= {"indice", "descricao", "destaques", "estado"}
