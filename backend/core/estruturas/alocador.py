from dataclasses import dataclass

from core.estruturas.linked_list import LinkedList

MEMORIA_TOTAL = 512


@dataclass
class Bloco:
    id: int
    tamanho: int
    livre: bool


class Alocador:
    def __init__(self, capacidade: int = MEMORIA_TOTAL) -> None:
        self._capacidade = capacidade
        self._lista: LinkedList[Bloco] = LinkedList()
        self._lista.push(Bloco(id=0, tamanho=capacidade, livre=True))
        self._next_id = 1

    def alocar(self, tamanho: int) -> dict[str, object] | None:
        for i, bloco in enumerate(self._lista):
            if bloco.livre and bloco.tamanho >= tamanho:
                restante = bloco.tamanho - tamanho
                bloco.tamanho = tamanho
                bloco.livre = False
                bloco_id = bloco.id
                if restante > 0:
                    novo = Bloco(id=self._next_id, tamanho=restante, livre=True)
                    self._next_id += 1
                    self._lista.insert_at(i + 1, novo)
                return {"id": bloco_id, "tamanho": tamanho}
        return None

    def liberar(self, bloco_id: int) -> bool:
        for bloco in self._lista:
            if bloco.id == bloco_id and not bloco.livre:
                bloco.livre = True
                self._coalescer()
                return True
        return False

    def _coalescer(self) -> None:
        i = 0
        while i < len(self._lista) - 1:
            atual = self._lista[i]
            proximo = self._lista[i + 1]
            if atual.livre and proximo.livre:
                atual.tamanho += proximo.tamanho
                self._lista.remove_at(i + 1)
            else:
                i += 1

    def estado(self) -> dict[str, object]:
        blocos: list[dict[str, object]] = []
        livre_total = 0
        for bloco in self._lista:
            blocos.append(
                {"id": bloco.id, "tamanho": bloco.tamanho, "livre": bloco.livre}
            )
            if bloco.livre:
                livre_total += bloco.tamanho
        maior_livre = max(
            (int(b["tamanho"]) for b in blocos if b["livre"]),
            default=0,
        )
        fragmentacao = (
            round(1 - maior_livre / livre_total, 2) if livre_total > 0 else 0.0
        )
        return {
            "blocos": blocos,
            "livre_total": livre_total,
            "usado_total": self._capacidade - livre_total,
            "fragmentacao": fragmentacao,
        }


def simular_alocador(operacoes: list[dict[str, object]]) -> dict[str, object]:
    a = Alocador()
    estados: list[dict[str, object]] = []
    for op in operacoes:
        tipo = op.get("tipo")
        if tipo == "alocar":
            resultado = a.alocar(int(op.get("tamanho", 64)))
            estados.append({"operacao": op, "resultado": resultado, **a.estado()})
        elif tipo == "liberar":
            sucesso = a.liberar(int(op.get("bloco_id", -1)))
            estados.append(
                {"operacao": op, "resultado": {"sucesso": sucesso}, **a.estado()}
            )
        else:
            raise ValueError(f"operação inválida: {tipo}")
    return {"estados": estados, "total_operacoes": len(operacoes)}
