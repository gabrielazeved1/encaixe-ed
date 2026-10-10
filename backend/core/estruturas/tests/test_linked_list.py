import pytest

from core.estruturas.linked_list import LinkedList


def test_lista_vazia_tem_tamanho_zero() -> None:
    ll: LinkedList[int] = LinkedList()
    assert len(ll) == 0
    assert list(ll) == []


def test_push_anexa_na_cauda() -> None:
    ll: LinkedList[int] = LinkedList()
    ll.push(1)
    ll.push(2)
    ll.push(3)
    assert list(ll) == [1, 2, 3]
    assert len(ll) == 3


def test_insert_at_no_inicio_de_lista_vazia() -> None:
    ll: LinkedList[int] = LinkedList()
    ll.insert_at(0, 42)
    assert list(ll) == [42]


def test_insert_at_no_meio() -> None:
    ll: LinkedList[int] = LinkedList()
    for v in (1, 2, 3):
        ll.push(v)
    ll.insert_at(1, 99)
    assert list(ll) == [1, 99, 2, 3]


def test_insert_at_na_cauda_equivalente_a_push() -> None:
    ll: LinkedList[int] = LinkedList()
    for v in (1, 2, 3):
        ll.push(v)
    ll.insert_at(3, 4)
    assert list(ll) == [1, 2, 3, 4]
    assert len(ll) == 4


def test_insert_at_fora_de_intervalo_levanta_index_error() -> None:
    ll: LinkedList[int] = LinkedList()
    ll.push(1)
    with pytest.raises(IndexError):
        ll.insert_at(-1, 0)
    with pytest.raises(IndexError):
        ll.insert_at(2, 0)


def test_remove_at_retorna_valor_e_atualiza_tamanho() -> None:
    ll: LinkedList[int] = LinkedList()
    for v in (1, 2, 3):
        ll.push(v)
    assert ll.remove_at(1) == 2
    assert list(ll) == [1, 3]
    assert len(ll) == 2


def test_remove_at_no_inicio() -> None:
    ll: LinkedList[int] = LinkedList()
    for v in (1, 2, 3):
        ll.push(v)
    assert ll.remove_at(0) == 1
    assert list(ll) == [2, 3]


def test_remove_at_na_cauda() -> None:
    ll: LinkedList[int] = LinkedList()
    for v in (1, 2, 3):
        ll.push(v)
    assert ll.remove_at(2) == 3
    assert list(ll) == [1, 2]


def test_remove_at_em_lista_vazia_levanta_index_error() -> None:
    ll: LinkedList[int] = LinkedList()
    with pytest.raises(IndexError):
        ll.remove_at(0)


def test_remove_at_fora_de_intervalo_levanta_index_error() -> None:
    ll: LinkedList[int] = LinkedList()
    ll.push(1)
    with pytest.raises(IndexError):
        ll.remove_at(1)
    with pytest.raises(IndexError):
        ll.remove_at(-1)


def test_push_apos_remove_tudo_mantem_consistencia() -> None:
    ll: LinkedList[int] = LinkedList()
    ll.push(1)
    ll.push(2)
    ll.remove_at(0)
    ll.remove_at(0)
    assert list(ll) == []
    ll.push(99)
    assert list(ll) == [99]
    assert len(ll) == 1
