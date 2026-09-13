type BlocoDict = dict[str, object]
type EstadoDict = dict[str, object]

MEMORIA_TOTAL = 512


class _Bloco:
    __slots__ = ("id", "tamanho", "livre", "proximo")

    def __init__(self, id: int, tamanho: int, livre: bool) -> None:
        self.id = id
        self.tamanho = tamanho
        self.livre = livre
        self.proximo: "_Bloco | None" = None


class LinkedList:
    def __init__(self) -> None:
        self._head: _Bloco = _Bloco(id=0, tamanho=MEMORIA_TOTAL, livre=True)
        self._next_id = 1

    def alocar(self, tamanho: int) -> BlocoDict | None:
        bloco: _Bloco | None = self._head
        while bloco is not None:
            if bloco.livre and bloco.tamanho >= tamanho:
                restante = bloco.tamanho - tamanho
                bloco.tamanho = tamanho
                bloco.livre = False
                bloco_id = bloco.id
                if restante > 0:
                    novo = _Bloco(id=self._next_id, tamanho=restante, livre=True)
                    self._next_id += 1
                    novo.proximo = bloco.proximo
                    bloco.proximo = novo
                return {"id": bloco_id, "tamanho": tamanho}
            bloco = bloco.proximo
        return None

    def liberar(self, bloco_id: int) -> bool:
        bloco: _Bloco | None = self._head
        while bloco is not None:
            if bloco.id == bloco_id and not bloco.livre:
                bloco.livre = True
                self._coalescer()
                return True
            bloco = bloco.proximo
        return False

    def _coalescer(self) -> None:
        bloco: _Bloco | None = self._head
        while bloco is not None and bloco.proximo is not None:
            if bloco.livre and bloco.proximo.livre:
                bloco.tamanho += bloco.proximo.tamanho
                bloco.proximo = bloco.proximo.proximo
            else:
                bloco = bloco.proximo

    def estado(self) -> EstadoDict:
        blocos: list[BlocoDict] = []
        bloco: _Bloco | None = self._head
        livre_total = 0
        while bloco is not None:
            blocos.append(
                {"id": bloco.id, "tamanho": bloco.tamanho, "livre": bloco.livre}
            )
            if bloco.livre:
                livre_total += bloco.tamanho
            bloco = bloco.proximo
        blocos_livres = [b for b in blocos if b["livre"]]
        maior_livre = max(
            (int(b["tamanho"]) for b in blocos_livres),
            default=0,
        )
        fragmentacao = (
            round(1 - maior_livre / livre_total, 2) if livre_total > 0 else 0.0
        )
        return {
            "blocos": blocos,
            "livre_total": livre_total,
            "usado_total": MEMORIA_TOTAL - livre_total,
            "fragmentacao": fragmentacao,
        }


def simular_alocador(operacoes: list[dict[str, object]]) -> dict[str, object]:
    ll = LinkedList()
    estados: list[dict[str, object]] = []
    for op in operacoes:
        tipo = op.get("tipo")
        if tipo == "alocar":
            resultado = ll.alocar(int(op.get("tamanho", 64)))
            estados.append({"operacao": op, "resultado": resultado, **ll.estado()})
        elif tipo == "liberar":
            sucesso = ll.liberar(int(op.get("bloco_id", -1)))
            estados.append(
                {"operacao": op, "resultado": {"sucesso": sucesso}, **ll.estado()}
            )
        else:
            raise ValueError(f"operação inválida: {tipo}")
    return {"estados": estados, "total_operacoes": len(operacoes)}
