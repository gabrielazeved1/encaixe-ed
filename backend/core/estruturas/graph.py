from collections import deque
from core.estruturas.heap import MinHeap

type ResultadoDict = dict[str, object]


class Graph:
    def __init__(self) -> None:
        self._adj: dict[str, list[tuple[str, int]]] = {}

    def add_no(self, nome: str) -> None:
        if nome not in self._adj:
            self._adj[nome] = []

    def add_aresta(self, origem: str, destino: str, custo: int = 1) -> None:
        self.add_no(origem)
        self.add_no(destino)
        self._adj[origem].append((destino, custo))
        self._adj[destino].append((origem, custo))

    def nos(self) -> list[str]:
        return list(self._adj.keys())

    def dijkstra(self, origem: str, destino: str) -> ResultadoDict:
        heap: MinHeap[str] = MinHeap()
        heap.push(0, origem)
        INF = float("inf")
        dist: dict[str, float] = {n: INF for n in self._adj}
        dist[origem] = 0
        prev: dict[str, str | None] = {n: None for n in self._adj}
        passos: list[dict[str, object]] = []
        visitados: set[str] = set()

        while not heap.is_empty():
            custo, no = heap.pop()
            if no in visitados:
                continue
            visitados.add(no)
            passos.append(
                {"no": no, "custo_acumulado": int(custo), "via": prev[no]}
            )
            if no == destino:
                break
            for vizinho, peso in self._adj.get(no, []):
                novo = custo + peso
                if novo < dist[vizinho]:
                    dist[vizinho] = novo
                    prev[vizinho] = no
                    heap.push(int(novo), vizinho)

        caminho: list[str] = []
        atual: str | None = destino
        while atual is not None:
            caminho.insert(0, atual)
            atual = prev.get(atual)

        if not caminho or caminho[0] != origem:
            return {"caminho": [], "custo_total": -1, "passos": passos}

        return {
            "caminho": caminho,
            "custo_total": int(dist[destino]),
            "passos": passos,
        }

    def bfs(self, origem: str, destino: str) -> ResultadoDict:
        fila: deque[str] = deque([origem])
        visitados: set[str] = {origem}
        prev: dict[str, str | None] = {n: None for n in self._adj}
        niveis: list[dict[str, object]] = []
        nivel_atual = [origem]
        encontrado = origem == destino

        while fila and not encontrado:
            proximo: list[str] = []
            for _ in range(len(nivel_atual)):
                no = fila.popleft()
                for vizinho, _peso in self._adj.get(no, []):
                    if vizinho not in visitados:
                        visitados.add(vizinho)
                        prev[vizinho] = no
                        fila.append(vizinho)
                        proximo.append(vizinho)
                        if vizinho == destino:
                            encontrado = True
            niveis.append({"nivel": len(niveis), "nos": list(nivel_atual)})
            nivel_atual = proximo

        caminho: list[str] = []
        atual: str | None = destino
        while atual is not None:
            caminho.insert(0, atual)
            atual = prev.get(atual)

        if not caminho or caminho[0] != origem:
            return {"caminho": [], "graus": -1, "niveis": niveis}

        return {
            "caminho": caminho,
            "graus": len(caminho) - 1,
            "niveis": niveis,
        }
