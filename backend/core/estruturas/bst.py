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

    def inserir(self, valor: int) -> None:
        self._raiz = self._ins(self._raiz, valor)

    def _ins(self, no: _No | None, valor: int) -> _No:
        if no is None:
            return _No(valor)
        if valor < no.valor:
            no.esq = self._ins(no.esq, valor)
        elif valor > no.valor:
            no.dir = self._ins(no.dir, valor)
        return no

    def buscar(self, valor: int) -> ResultadoDict:
        passos: list[dict[str, object]] = []
        no = self._raiz
        while no is not None:
            if valor == no.valor:
                passos.append({"no": no.valor, "comparacao": "igual"})
                return {"encontrado": True, "passos": passos}
            elif valor < no.valor:
                passos.append({"no": no.valor, "comparacao": "menor"})
                no = no.esq
            else:
                passos.append({"no": no.valor, "comparacao": "maior"})
                no = no.dir
        return {"encontrado": False, "passos": passos}

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
    arvore = BST()
    for v in valores:
        arvore.inserir(v)
    resultado = arvore.buscar(alvo)
    sorted_vals = sorted(set(valores))
    linear_comp = next(
        (i + 1 for i, v in enumerate(sorted_vals) if v == alvo),
        len(sorted_vals),
    )
    passos = resultado["passos"]
    assert isinstance(passos, list)
    return {
        "arvore": arvore.para_dict(),
        "passos": passos,
        "encontrado": resultado["encontrado"],
        "comparacoes_bst": len(passos),
        "comparacoes_linear": linear_comp,
    }
