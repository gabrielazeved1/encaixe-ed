from typing import Generic, Iterator, TypeVar

T = TypeVar("T")


class Node(Generic[T]):
    __slots__ = ("valor", "proximo")

    def __init__(self, valor: T) -> None:
        self.valor: T = valor
        self.proximo: "Node[T] | None" = None


class LinkedList(Generic[T]):
    def __init__(self) -> None:
        self._head: Node[T] | None = None
        self._tail: Node[T] | None = None
        self._tamanho: int = 0

    def __len__(self) -> int:
        return self._tamanho

    def __iter__(self) -> Iterator[T]:
        atual = self._head
        while atual is not None:
            yield atual.valor
            atual = atual.proximo

    def __getitem__(self, pos: int) -> T:
        if pos < 0 or pos >= self._tamanho:
            raise IndexError(f"__getitem__: posição {pos} fora de [0, {self._tamanho - 1}]")
        return self._nodo_em(pos).valor

    def push(self, item: T) -> None:
        novo = Node(item)
        if self._tail is None:
            self._head = novo
            self._tail = novo
        else:
            self._tail.proximo = novo
            self._tail = novo
        self._tamanho += 1

    def insert_at(self, pos: int, item: T) -> None:
        if pos < 0 or pos > self._tamanho:
            raise IndexError(f"insert_at: posição {pos} fora de [0, {self._tamanho}]")
        if pos == self._tamanho:
            self.push(item)
            return
        novo = Node(item)
        if pos == 0:
            novo.proximo = self._head
            self._head = novo
        else:
            anterior = self._nodo_em(pos - 1)
            novo.proximo = anterior.proximo
            anterior.proximo = novo
        self._tamanho += 1

    def remove_at(self, pos: int) -> T:
        if self._tamanho == 0:
            raise IndexError("remove_at: lista vazia")
        if pos < 0 or pos >= self._tamanho:
            raise IndexError(f"remove_at: posição {pos} fora de [0, {self._tamanho - 1}]")
        if pos == 0:
            removido = self._head
            assert removido is not None
            self._head = removido.proximo
            if self._head is None:
                self._tail = None
        else:
            anterior = self._nodo_em(pos - 1)
            removido = anterior.proximo
            assert removido is not None
            anterior.proximo = removido.proximo
            if removido is self._tail:
                self._tail = anterior
        self._tamanho -= 1
        return removido.valor

    def _nodo_em(self, pos: int) -> Node[T]:
        atual = self._head
        for _ in range(pos):
            assert atual is not None
            atual = atual.proximo
        assert atual is not None
        return atual
