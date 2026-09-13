from core.estruturas.graph import Graph


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
