from core.estruturas.graph import Graph

BASELINE_DIJKSTRA = {
    "passos_antes": 3,
    "custo_total": 3,
    "caminho": ["A", "B", "C"],
    "distancias": {"A": 0, "B": 1, "C": 3},
}


def _grafo_referencia() -> Graph:
    g = Graph()
    g.add_aresta("A", "B", 1)
    g.add_aresta("A", "C", 4)
    g.add_aresta("B", "C", 2)
    return g


def test_dijkstra_distancias_inalteradas() -> None:
    g = _grafo_referencia()
    resultado = g.dijkstra("A", "C")
    assert resultado["distancias"] == BASELINE_DIJKSTRA["distancias"]
    assert resultado["custo_total"] == BASELINE_DIJKSTRA["custo_total"]
    assert resultado["caminho"] == BASELINE_DIJKSTRA["caminho"]


def test_dijkstra_emite_passos_de_relaxamento() -> None:
    g = _grafo_referencia()
    resultado = g.dijkstra("A", "C")
    passos = resultado["passos"]
    assert isinstance(passos, list)
    tem_aresta = False
    for p in passos:
        destaques = p.get("destaques") if isinstance(p, dict) else None
        if destaques and any(d.startswith("aresta:") for d in destaques):
            tem_aresta = True
            estado = p.get("estado")
            assert isinstance(estado, dict)
            assert isinstance(estado.get("distancias"), dict)
    assert tem_aresta, "nenhum passo contém destaque 'aresta:*'"


def test_dijkstra_relaxamento_descreve_atualizacao() -> None:
    g = _grafo_referencia()
    resultado = g.dijkstra("A", "C")
    passos = resultado["passos"]
    passos_atualizo = [
        p
        for p in passos
        if isinstance(p, dict)
        and "atualizo" in str(p.get("descricao", ""))
        and "aresta:A-B" in (p.get("destaques") or [])
    ]
    assert len(passos_atualizo) >= 1, "esperava passo de atualização em A→B"


def test_dijkstra_relaxamento_descreve_manutencao() -> None:
    g = _grafo_referencia()
    resultado = g.dijkstra("A", "C")
    passos = resultado["passos"]
    tem_manutencao = any(
        isinstance(p, dict) and "mantenho" in str(p.get("descricao", ""))
        for p in passos
    )
    assert tem_manutencao, "esperava ao menos um passo de manutenção (aresta não melhora)"


def test_dijkstra_passos_cresceu() -> None:
    g = _grafo_referencia()
    resultado = g.dijkstra("A", "C")
    assert len(resultado["passos"]) > BASELINE_DIJKSTRA["passos_antes"]


def test_dijkstra_caminho_simples() -> None:
    g = Graph()
    g.add_aresta("A", "B", 1)
    g.add_aresta("B", "C", 2)
    g.add_aresta("A", "C", 10)
    resultado = g.dijkstra("A", "C")
    assert resultado["caminho"] == ["A", "B", "C"]
    assert resultado["custo_total"] == 3


def test_dijkstra_sem_caminho_retorna_lista_vazia() -> None:
    g = Graph()
    g.add_no("A")
    g.add_no("B")
    resultado = g.dijkstra("A", "B")
    assert resultado["caminho"] == []
    assert resultado["custo_total"] == -1


def test_bfs_graus_direto() -> None:
    g = Graph()
    g.add_aresta("A", "B")
    resultado = g.bfs("A", "B")
    assert resultado["graus"] == 1
    assert resultado["caminho"] == ["A", "B"]


def test_bfs_graus_indireto() -> None:
    g = Graph()
    g.add_aresta("A", "B")
    g.add_aresta("B", "C")
    g.add_aresta("C", "D")
    resultado = g.bfs("A", "D")
    assert resultado["graus"] == 3
    assert resultado["caminho"] == ["A", "B", "C", "D"]


def test_bfs_sem_caminho() -> None:
    g = Graph()
    g.add_no("A")
    g.add_no("B")
    resultado = g.bfs("A", "B")
    assert resultado["graus"] == -1
    assert resultado["caminho"] == []
