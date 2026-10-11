from core.estruturas.passos import PassoColetor, fazer_passo

type NoDict = dict[str, object]
type ResultadoDict = dict[str, object]


class _No:
    __slots__ = ("valor", "esq", "dir")

    def __init__(self, valor: int) -> None:
        self.valor = valor
        self.esq: "_No | None" = None
        self.dir: "_No | None" = None


class BST:
    def __init__(self) -> None:
        self._raiz: _No | None = None

    def inserir(self, valor: int, coletor: PassoColetor | None = None) -> None:
        if self._raiz is None:
            self._raiz = _No(valor)
            if coletor is not None:
                fazer_passo(
                    coletor,
                    f"Árvore vazia. Inserindo {valor} como raiz.",
                    [f"no:{valor}"],
                    self.para_dict(),
                )
            return

        no = self._raiz
        while True:
            if valor == no.valor:
                return
            rotulo = "raiz" if no is self._raiz else "nó"
            if valor < no.valor:
                if coletor is not None:
                    fazer_passo(
                        coletor,
                        f"Inserindo {valor}. Comparando com {rotulo} {no.valor} → {valor} < {no.valor}, desce para a esquerda.",
                        [f"no:{no.valor}"],
                        self.para_dict(),
                    )
                if no.esq is None:
                    no.esq = _No(valor)
                    if coletor is not None:
                        fazer_passo(
                            coletor,
                            f"Posição vazia à esquerda de {no.valor}. Inserindo {valor} ali.",
                            [f"no:{valor}"],
                            self.para_dict(),
                        )
                    return
                no = no.esq
            else:
                if coletor is not None:
                    fazer_passo(
                        coletor,
                        f"Inserindo {valor}. Comparando com {rotulo} {no.valor} → {valor} > {no.valor}, desce para a direita.",
                        [f"no:{no.valor}"],
                        self.para_dict(),
                    )
                if no.dir is None:
                    no.dir = _No(valor)
                    if coletor is not None:
                        fazer_passo(
                            coletor,
                            f"Posição vazia à direita de {no.valor}. Inserindo {valor} ali.",
                            [f"no:{valor}"],
                            self.para_dict(),
                        )
                    return
                no = no.dir

    def buscar(self, valor: int, coletor: PassoColetor | None = None) -> ResultadoDict:
        passos_busca: list[dict[str, object]] = []
        no = self._raiz
        while no is not None:
            rotulo = "raiz" if no is self._raiz else "nó"
            if valor == no.valor:
                passos_busca.append({"no": no.valor, "comparacao": "igual"})
                if coletor is not None:
                    fazer_passo(
                        coletor,
                        f"Buscando {valor}. Comparando com {rotulo} {no.valor} → Chave encontrada.",
                        [f"no:{no.valor}"],
                        self.para_dict(),
                    )
                return {"encontrado": True, "passos": passos_busca}
            elif valor < no.valor:
                passos_busca.append({"no": no.valor, "comparacao": "menor"})
                if coletor is not None:
                    fazer_passo(
                        coletor,
                        f"Buscando {valor}. Comparando com {rotulo} {no.valor} → {valor} < {no.valor}, desce para a esquerda.",
                        [f"no:{no.valor}"],
                        self.para_dict(),
                    )
                no = no.esq
            else:
                passos_busca.append({"no": no.valor, "comparacao": "maior"})
                if coletor is not None:
                    fazer_passo(
                        coletor,
                        f"Buscando {valor}. Comparando com {rotulo} {no.valor} → {valor} > {no.valor}, desce para a direita.",
                        [f"no:{no.valor}"],
                        self.para_dict(),
                    )
                no = no.dir
        if coletor is not None:
            fazer_passo(
                coletor,
                f"Chave {valor} não encontrada na árvore.",
                [],
                self.para_dict(),
            )
        return {"encontrado": False, "passos": passos_busca}

    def para_dict(self) -> NoDict | None:
        return self._to_dict(self._raiz)

    def _to_dict(self, no: _No | None) -> NoDict | None:
        if no is None:
            return None
        return {
            "valor": no.valor,
            "esq": self._to_dict(no.esq),
            "dir": self._to_dict(no.dir),
        }


def simular_bst(valores: list[int], alvo: int) -> ResultadoDict:
    if not valores:
        raise ValueError("lista de valores não pode ser vazia")
    coletor: PassoColetor = []
    arvore = BST()
    for v in valores:
        arvore.inserir(v, coletor)
    resultado = arvore.buscar(alvo, coletor)
    linear_comp = next(
        (i + 1 for i, v in enumerate(valores) if v == alvo),
        len(valores),
    )
    passos_busca = resultado["passos"]
    assert isinstance(passos_busca, list)
    return {
        "arvore": arvore.para_dict(),
        "passos_busca": passos_busca,
        "passos": coletor,
        "encontrado": resultado["encontrado"],
        "comparacoes_bst": len(passos_busca),
        "comparacoes_linear": linear_comp,
    }
