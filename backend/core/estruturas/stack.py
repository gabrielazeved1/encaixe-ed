from typing import TypeVar, Generic

T = TypeVar("T")

MAX_DEPTH = 50


class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        if self.is_empty():
            raise IndexError("pop em pilha vazia")
        return self._items.pop()

    def peek(self) -> T:
        if self.is_empty():
            raise IndexError("peek em pilha vazia")
        return self._items[-1]

    def is_empty(self) -> bool:
        return len(self._items) == 0

    def __len__(self) -> int:
        return len(self._items)

    def snapshot(self) -> list[T]:
        return list(self._items)


type FrameDict = dict[str, object]
type EventoDict = dict[str, object]


def _make_frame(
    nome_funcao: str, argumento: int, retorno: int | None, profundidade: int
) -> FrameDict:
    return {
        "nome_funcao": nome_funcao,
        "argumento": argumento,
        "retorno": retorno,
        "profundidade": profundidade,
    }


def _make_evento(
    tipo: str, frame: FrameDict, pilha_estado: list[FrameDict]
) -> EventoDict:
    return {"tipo": tipo, "frame": frame, "pilha_estado": list(pilha_estado)}


def _simular_fatorial(
    n: int, pilha: Stack[FrameDict], eventos: list[EventoDict]
) -> int | None:
    if len(pilha) >= MAX_DEPTH:
        frame = _make_frame("fatorial", n, None, len(pilha) + 1)
        eventos.append(_make_evento("overflow", frame, pilha.snapshot()))
        return None

    frame = _make_frame("fatorial", n, None, len(pilha) + 1)
    pilha.push(frame)
    eventos.append(_make_evento("push", frame, pilha.snapshot()))

    if n <= 1:
        resultado = 1
    else:
        sub = _simular_fatorial(n - 1, pilha, eventos)
        if sub is None:
            return None
        resultado = n * sub

    frame_pop = _make_frame("fatorial", n, resultado, len(pilha))
    pilha.pop()
    eventos.append(_make_evento("pop", frame_pop, pilha.snapshot()))
    return resultado


def _simular_fibonacci(
    n: int, pilha: Stack[FrameDict], eventos: list[EventoDict]
) -> int | None:
    if len(pilha) >= MAX_DEPTH:
        frame = _make_frame("fibonacci", n, None, len(pilha) + 1)
        eventos.append(_make_evento("overflow", frame, pilha.snapshot()))
        return None

    frame = _make_frame("fibonacci", n, None, len(pilha) + 1)
    pilha.push(frame)
    eventos.append(_make_evento("push", frame, pilha.snapshot()))

    if n <= 1:
        resultado = n
    else:
        esq = _simular_fibonacci(n - 1, pilha, eventos)
        if esq is None:
            return None
        dir_ = _simular_fibonacci(n - 2, pilha, eventos)
        if dir_ is None:
            return None
        resultado = esq + dir_

    frame_pop = _make_frame("fibonacci", n, resultado, len(pilha))
    pilha.pop()
    eventos.append(_make_evento("pop", frame_pop, pilha.snapshot()))
    return resultado


def simular_pilha(
    funcao: str, valor: int, max_depth: int = MAX_DEPTH
) -> dict[str, object]:
    if valor < 1:
        raise ValueError("valor deve ser um inteiro positivo")
    if funcao not in ("fatorial", "fibonacci"):
        raise ValueError(f"função inválida: {funcao}")

    pilha: Stack[FrameDict] = Stack()
    eventos: list[EventoDict] = []

    global MAX_DEPTH
    original = MAX_DEPTH
    MAX_DEPTH = max_depth

    try:
        if funcao == "fatorial":
            _simular_fatorial(valor, pilha, eventos)
        else:
            _simular_fibonacci(valor, pilha, eventos)
    finally:
        MAX_DEPTH = original

    overflow = any(e["tipo"] == "overflow" for e in eventos)
    return {
        "funcao": funcao,
        "valor": valor,
        "status": "overflow" if overflow else "completo",
        "frames": eventos,
    }
