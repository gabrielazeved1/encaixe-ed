import ast
import random
from pathlib import Path

import pytest
from core.estruturas.heap import MinHeap


def test_push_e_pop_ordem_crescente() -> None:
    h: MinHeap[str] = MinHeap()
    h.push(5, "a")
    h.push(1, "b")
    h.push(3, "c")
    p1, i1 = h.pop()
    p2, i2 = h.pop()
    p3, i3 = h.pop()
    assert (p1, i1) == (1, "b")
    assert (p2, i2) == (3, "c")
    assert (p3, i3) == (5, "a")


def test_peek_nao_remove() -> None:
    h: MinHeap[str] = MinHeap()
    h.push(2, "x")
    h.push(1, "y")
    assert h.peek() == (1, "y")
    assert len(h) == 2


def test_pop_em_heap_vazio_levanta_excecao() -> None:
    h: MinHeap[int] = MinHeap()
    with pytest.raises(IndexError):
        h.pop()


def test_tie_breaking_preserva_insercao() -> None:
    h: MinHeap[str] = MinHeap()
    h.push(1, "a")
    h.push(1, "b")
    h.push(1, "c")
    assert h.pop()[1] == "a"
    assert h.pop()[1] == "b"
    assert h.pop()[1] == "c"


def test_heap_nao_importa_heapq() -> None:
    caminho = Path(__file__).resolve().parents[1] / "heap.py"
    arvore = ast.parse(caminho.read_text())
    for node in ast.walk(arvore):
        if isinstance(node, ast.Import):
            for alias in node.names:
                assert alias.name != "heapq", "heap.py não pode importar heapq"
        elif isinstance(node, ast.ImportFrom):
            assert node.module != "heapq", "heap.py não pode importar de heapq"


def test_sift_up_e_sift_down_existem() -> None:
    assert hasattr(MinHeap, "_sift_up")
    assert hasattr(MinHeap, "_sift_down")


def test_sift_down_apos_pop_mantem_invariante() -> None:
    rng = random.Random(42)
    valores = [rng.randint(0, 1000) for _ in range(20)]
    h: MinHeap[int] = MinHeap()
    for v in valores:
        h.push(v, v)
    saida = [h.pop()[0] for _ in range(len(valores))]
    assert saida == sorted(valores)
