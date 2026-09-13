import heapq
from typing import TypeVar, Generic

T = TypeVar("T")


class MinHeap(Generic[T]):
    def __init__(self) -> None:
        self._data: list[tuple[int, int, T]] = []
        self._counter = 0

    def push(self, priority: int, item: T) -> None:
        heapq.heappush(self._data, (priority, self._counter, item))
        self._counter += 1

    def pop(self) -> tuple[int, T]:
        if self.is_empty():
            raise IndexError("pop em heap vazio")
        priority, _, item = heapq.heappop(self._data)
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
