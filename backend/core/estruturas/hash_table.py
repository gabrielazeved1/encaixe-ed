type EntradaDict = dict[str, object]
type ResultadoDict = dict[str, object]


class HashTable:
    def __init__(self, tamanho: int = 16) -> None:
        self._tamanho = tamanho
        self._buckets: list[list[tuple[str, object]]] = [[] for _ in range(tamanho)]

    def _hash(self, chave: str) -> int:
        h = 0
        for c in chave:
            h = (h * 31 + ord(c)) % self._tamanho
        return h

    def inserir(self, chave: str, valor: object) -> None:
        idx = self._hash(chave)
        for i, (k, _) in enumerate(self._buckets[idx]):
            if k == chave:
                self._buckets[idx][i] = (chave, valor)
                return
        self._buckets[idx].append((chave, valor))

    def buscar(self, chave: str) -> tuple[object | None, int]:
        idx = self._hash(chave)
        comparacoes = 1
        for k, v in self._buckets[idx]:
            comparacoes += 1
            if k == chave:
                return v, comparacoes
        return None, comparacoes

    def indice(self, chave: str) -> int:
        return self._hash(chave)


def comparar_busca(dados: list[EntradaDict], chave: str) -> ResultadoDict:
    linear_comp = 0
    linear_encontrado = False
    for entrada in dados:
        linear_comp += 1
        if str(entrada["chave"]) == chave:
            linear_encontrado = True
            break

    ht = HashTable()
    for entrada in dados:
        ht.inserir(str(entrada["chave"]), entrada["valor"])

    _, hash_comp = ht.buscar(chave)
    idx = ht.indice(chave)

    return {
        "linear": {"comparacoes": linear_comp, "encontrado": linear_encontrado},
        "hash": {
            "comparacoes": hash_comp,
            "encontrado": linear_encontrado,
            "indice": idx,
        },
    }
