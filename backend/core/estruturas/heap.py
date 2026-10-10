from typing import TypeVar, Generic

T = TypeVar("T")


class MinHeap(Generic[T]):
    def __init__(self) -> None:
        self._data: list[tuple[int, int, T]] = []
        self._counter = 0

    def push(self, priority: int, item: T) -> None:
        self._data.append((priority, self._counter, item))
        self._counter += 1
        self._sift_up(len(self._data) - 1)

    def pop(self) -> tuple[int, T]:
        if self.is_empty():
            raise IndexError("pop em heap vazio")
        topo = self._data[0]
        ultimo = self._data.pop()
        if self._data:
            self._data[0] = ultimo
            self._sift_down(0)
        priority, _, item = topo
        return priority, item

    def peek(self) -> tuple[int, T]:
        if self.is_empty():
            raise IndexError("peek em heap vazio")
        priority, _, item = self._data[0]
        return priority, item

    def is_empty(self) -> bool:
        return len(self._data) == 0

    def __len__(self) -> int:
        return len(self._data)

    def _sift_up(self, idx: int) -> None:
        while idx > 0:
            pai = (idx - 1) // 2
            if self._data[idx] < self._data[pai]:
                self._data[idx], self._data[pai] = self._data[pai], self._data[idx]
                idx = pai
            else:
                return

    def _sift_down(self, idx: int) -> None:
        n = len(self._data)
        while True:
            esq = 2 * idx + 1
            dir = 2 * idx + 2
            menor = idx
            if esq < n and self._data[esq] < self._data[menor]:
                menor = esq
            if dir < n and self._data[dir] < self._data[menor]:
                menor = dir
            if menor == idx:
                return
            self._data[idx], self._data[menor] = self._data[menor], self._data[idx]
            idx = menor
