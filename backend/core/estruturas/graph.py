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
        visitados: list[str] = []

        def _dist_json() -> dict[str, int | None]:
            return {n: (int(v) if v != INF else None) for n, v in dist.items()}

        def _fmt(v: float) -> str:
            return "∞" if v == INF else str(int(v))

        while not heap.is_empty():
            custo, no = heap.pop()
            if no in visitados:
                continue
            visitados.append(no)
            passos.append(
                {"no": no, "custo_acumulado": int(custo), "via": prev[no]}
            )
            if no == destino:
                break
            for vizinho, peso in self._adj.get(no, []):
                atual = dist[vizinho]
                novo = custo + peso
                if novo < atual:
                    acao = "atualizo"
                    descricao = (
                        f"Olhando aresta {no}→{vizinho} (peso {peso}). "
                        f"Custo atual de {vizinho} é {_fmt(atual)}. "
                        f"Via {no} dá {int(novo)} → atualizo {vizinho} para {int(novo)}."
                    )
                else:
                    acao = "mantenho"
                    descricao = (
                        f"Olhando aresta {no}→{vizinho} (peso {peso}). "
                        f"Custo atual de {vizinho} é {_fmt(atual)}. "
                        f"Via {no} dá {int(novo)} → mantenho {vizinho} em {_fmt(atual)}."
                    )
                if novo < atual:
                    dist[vizinho] = novo
                    prev[vizinho] = no
                    heap.push(int(novo), vizinho)
                passos.append(
                    {
                        "indice": len(passos),
                        "tipo": "relaxamento",
                        "acao": acao,
                        "descricao": descricao,
                        "destaques": [
                            f"no:{no}",
                            f"no:{vizinho}",
                            f"aresta:{no}-{vizinho}",
                        ],
                        "estado": {
                            "distancias": _dist_json(),
                            "visitados": list(visitados),
                        },
                    }
                )

        caminho: list[str] = []
        atual_no: str | None = destino
        while atual_no is not None:
            caminho.insert(0, atual_no)
            atual_no = prev.get(atual_no)

        if not caminho or caminho[0] != origem:
            return {
                "caminho": [],
                "custo_total": -1,
                "passos": passos,
                "distancias": _dist_json(),
            }

        return {
            "caminho": caminho,
            "custo_total": int(dist[destino]),
            "passos": passos,
            "distancias": _dist_json(),
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
