from typing import TypeVar, Generic
from collections import deque

T = TypeVar("T")


class Queue(Generic[T]):
    def __init__(self) -> None:
        self._items: deque[T] = deque()

    def enqueue(self, item: T) -> None:
        self._items.append(item)

    def dequeue(self) -> T:
        if self.is_empty():
            raise IndexError("dequeue em fila vazia")
        return self._items.popleft()

    def peek(self) -> T:
        if self.is_empty():
            raise IndexError("peek em fila vazia")
        return self._items[0]

    def is_empty(self) -> bool:
        return len(self._items) == 0

    def __len__(self) -> int:
        return len(self._items)

    def snapshot(self) -> list[T]:
        return list(self._items)


type ProcessoDict = dict[str, object]
type GanttItem = dict[str, object]


def simular_escalonador(
    processos: list[ProcessoDict],
    algoritmo: str,
    quantum: int = 4,
) -> dict[str, object]:
    if algoritmo == "round-robin":
        return _round_robin(processos, quantum)
    if algoritmo == "prioridade":
        return _prioridade(processos, quantum)
    raise ValueError(f"algoritmo inválido: {algoritmo}")


def _round_robin(processos: list[ProcessoDict], quantum: int) -> dict[str, object]:
    fila: Queue[dict[str, object]] = Queue()
    copia = [
        {"id": p["id"], "nome": p["nome"], "restante": int(p["duracao"])}
        for p in processos
    ]
    for p in copia:
        fila.enqueue(p)
    gantt: list[GanttItem] = []
    tempo = 0
    while not fila.is_empty():
        proc = fila.dequeue()
        inicio = tempo
        restante = int(proc["restante"])
        exec_ = min(quantum, restante)
        tempo += exec_
        proc["restante"] = restante - exec_
        gantt.append(
            {
                "processo_id": proc["id"],
                "nome": proc["nome"],
                "inicio": inicio,
                "fim": tempo,
            }
        )
        if int(proc["restante"]) > 0:
            fila.enqueue(proc)
    return {
        "algoritmo": "round-robin",
        "quantum": quantum,
        "gantt": gantt,
        "tempo_total": tempo,
    }


def _prioridade(processos: list[ProcessoDict], quantum: int) -> dict[str, object]:
    from core.estruturas.heap import MinHeap

    heap: MinHeap[dict[str, object]] = MinHeap()
    for p in processos:
        heap.push(
            int(p["prioridade"]),
            {
                "id": p["id"],
                "nome": p["nome"],
                "prioridade": int(p["prioridade"]),
                "restante": int(p["duracao"]),
            },
        )
    gantt: list[GanttItem] = []
    tempo = 0
    while not heap.is_empty():
        _, proc = heap.pop()
        inicio = tempo
        restante = int(proc["restante"])
        exec_ = min(quantum, restante)
        tempo += exec_
        proc["restante"] = restante - exec_
        gantt.append(
            {
                "processo_id": proc["id"],
                "nome": proc["nome"],
                "inicio": inicio,
                "fim": tempo,
            }
        )
        if int(proc["restante"]) > 0:
            heap.push(int(proc["prioridade"]), proc)
    return {
        "algoritmo": "prioridade",
        "quantum": quantum,
        "gantt": gantt,
        "tempo_total": tempo,
    }
