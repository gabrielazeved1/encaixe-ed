from core.estruturas.passos import PassoColetor, fazer_passo

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

    def para_dict(self) -> dict[str, object]:
        return {
            "tamanho": self._tamanho,
            "buckets": [list(b) for b in self._buckets],
        }

    def inserir(
        self,
        chave: str,
        valor: object,
        coletor: PassoColetor | None = None,
    ) -> None:
        idx = self._hash(chave)
        bucket = self._buckets[idx]
        colidido = len(bucket) > 0
        if coletor is not None:
            if not colidido:
                descricao = (
                    f'Inserindo "{chave}" → h("{chave}") = {idx}. '
                    f"Bucket {idx} está vazio."
                )
            else:
                ocupantes = ", ".join(f'"{k}"' for k, _ in bucket)
                descricao = (
                    f'Inserindo "{chave}" → h("{chave}") = {idx}. '
                    f"Colisão: bucket {idx} já tem {ocupantes}. "
                    f"Adicionando ao final da lista."
                )
            fazer_passo(coletor, descricao, [f"bucket:{idx}"], self.para_dict())

        for i, (k, _) in enumerate(bucket):
            if k == chave:
                bucket[i] = (chave, valor)
                return
        bucket.append((chave, valor))

    def buscar(
        self,
        chave: str,
        coletor: PassoColetor | None = None,
    ) -> tuple[object | None, int]:
        idx = self._hash(chave)
        bucket = self._buckets[idx]
        comparacoes = 1
        if coletor is not None:
            fazer_passo(
                coletor,
                f'Buscando "{chave}" → h("{chave}") = {idx}. '
                f"Bucket {idx} tem {len(bucket)} item(ns).",
                [f"bucket:{idx}"],
                self.para_dict(),
            )
        for k, v in bucket:
            comparacoes += 1
            if coletor is not None:
                encontrado_agora = k == chave
                descricao = (
                    f'Chave encontrada: "{chave}" ({comparacoes} comparações).'
                    if encontrado_agora
                    else f'Comparando com "{k}" no bucket {idx} → chave diferente.'
                )
                fazer_passo(
                    coletor, descricao, [f"bucket:{idx}"], self.para_dict()
                )
            if k == chave:
                return v, comparacoes
        if coletor is not None:
            fazer_passo(
                coletor,
                f'Chave "{chave}" não encontrada no bucket {idx}.',
                [f"bucket:{idx}"],
                self.para_dict(),
            )
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

    coletor: PassoColetor = []
    ht = HashTable()
    fazer_passo(
        coletor,
        f"Tabela vazia ({ht._tamanho} buckets). Pronta para receber inserções.",
        [],
        ht.para_dict(),
    )
    for entrada in dados:
        ht.inserir(str(entrada["chave"]), entrada["valor"], coletor)

    _, hash_comp = ht.buscar(chave, coletor)
    idx = ht.indice(chave)

    return {
        "linear": {"comparacoes": linear_comp, "encontrado": linear_encontrado},
        "hash": {
            "comparacoes": hash_comp,
            "encontrado": linear_encontrado,
            "indice": idx,
        },
        "passos": coletor,
    }
