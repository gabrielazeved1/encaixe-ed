from typing import TypeVar, Generic

from core.estruturas.passos import PassoColetor, fazer_passo

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


def _registrar_push(
    passos: PassoColetor,
    nome_funcao: str,
    n: int,
    pilha: Stack[FrameDict],
    chamada_recursiva: bool,
) -> None:
    acao = (
        f"Chamando {nome_funcao}({n}) recursivamente"
        if chamada_recursiva
        else f"Chamando {nome_funcao}({n})"
    )
    fazer_passo(
        passos,
        f"{acao}. Empurrando frame na pilha.",
        [f"frame:{n}"],
        pilha.snapshot(),
    )


def _registrar_pop(
    passos: PassoColetor,
    nome_funcao: str,
    n: int,
    resultado: int,
    pilha: Stack[FrameDict],
) -> None:
    fazer_passo(
        passos,
        f"{nome_funcao}({n}) retornou {resultado}. Desempilhando frame.",
        [f"frame:{n}"],
        pilha.snapshot(),
    )


def _registrar_overflow(
    passos: PassoColetor, nome_funcao: str, n: int, pilha: Stack[FrameDict]
) -> None:
    fazer_passo(
        passos,
        (
            f"A pilha estourou (MAX_DEPTH atingido) tentando chamar "
            f"{nome_funcao}({n}). Isso é um stack overflow."
        ),
        [f"frame:{n}"],
        pilha.snapshot(),
    )


def _simular_fatorial(
    n: int,
    pilha: Stack[FrameDict],
    eventos: list[EventoDict],
    passos: PassoColetor,
    recursiva: bool,
) -> int | None:
    if len(pilha) >= MAX_DEPTH:
        frame = _make_frame("fatorial", n, None, len(pilha) + 1)
        eventos.append(_make_evento("overflow", frame, pilha.snapshot()))
        _registrar_overflow(passos, "fatorial", n, pilha)
        return None

    frame = _make_frame("fatorial", n, None, len(pilha) + 1)
    pilha.push(frame)
    eventos.append(_make_evento("push", frame, pilha.snapshot()))
    _registrar_push(passos, "fatorial", n, pilha, recursiva)

    if n <= 1:
        resultado = 1
    else:
        sub = _simular_fatorial(n - 1, pilha, eventos, passos, recursiva=True)
        if sub is None:
            return None
        resultado = n * sub

    frame_pop = _make_frame("fatorial", n, resultado, len(pilha))
    pilha.pop()
    eventos.append(_make_evento("pop", frame_pop, pilha.snapshot()))
    _registrar_pop(passos, "fatorial", n, resultado, pilha)
    return resultado


def _simular_fibonacci(
    n: int,
    pilha: Stack[FrameDict],
    eventos: list[EventoDict],
    passos: PassoColetor,
    recursiva: bool,
) -> int | None:
    if len(pilha) >= MAX_DEPTH:
        frame = _make_frame("fibonacci", n, None, len(pilha) + 1)
        eventos.append(_make_evento("overflow", frame, pilha.snapshot()))
        _registrar_overflow(passos, "fibonacci", n, pilha)
        return None

    frame = _make_frame("fibonacci", n, None, len(pilha) + 1)
    pilha.push(frame)
    eventos.append(_make_evento("push", frame, pilha.snapshot()))
    _registrar_push(passos, "fibonacci", n, pilha, recursiva)

    if n <= 1:
        resultado = n
    else:
        esq = _simular_fibonacci(n - 1, pilha, eventos, passos, recursiva=True)
        if esq is None:
            return None
        dir_ = _simular_fibonacci(n - 2, pilha, eventos, passos, recursiva=True)
        if dir_ is None:
            return None
        resultado = esq + dir_

    frame_pop = _make_frame("fibonacci", n, resultado, len(pilha))
    pilha.pop()
    eventos.append(_make_evento("pop", frame_pop, pilha.snapshot()))
    _registrar_pop(passos, "fibonacci", n, resultado, pilha)
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
    passos: PassoColetor = []

    global MAX_DEPTH
    original = MAX_DEPTH
    MAX_DEPTH = max_depth

    try:
        if funcao == "fatorial":
            _simular_fatorial(valor, pilha, eventos, passos, recursiva=False)
        else:
            _simular_fibonacci(valor, pilha, eventos, passos, recursiva=False)
    finally:
        MAX_DEPTH = original

    overflow = any(e["tipo"] == "overflow" for e in eventos)
    return {
        "funcao": funcao,
        "valor": valor,
        "status": "overflow" if overflow else "completo",
        "frames": eventos,
        "passos": passos,
    }
