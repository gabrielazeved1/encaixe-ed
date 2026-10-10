import pytest
from core.estruturas.queue import Queue, simular_escalonador


def test_enqueue_aumenta_tamanho() -> None:
    q: Queue[int] = Queue()
    q.enqueue(1)
    q.enqueue(2)
    assert len(q) == 2


def test_dequeue_retorna_e_remove_primeiro() -> None:
    q: Queue[int] = Queue()
    q.enqueue(10)
    q.enqueue(20)
    assert q.dequeue() == 10
    assert len(q) == 1


def test_peek_nao_remove() -> None:
    q: Queue[int] = Queue()
    q.enqueue(42)
    assert q.peek() == 42
    assert len(q) == 1


def test_is_empty() -> None:
    q: Queue[int] = Queue()
    assert q.is_empty()
    q.enqueue(1)
    assert not q.is_empty()


def test_dequeue_em_fila_vazia_levanta_excecao() -> None:
    q: Queue[int] = Queue()
    with pytest.raises(IndexError):
        q.dequeue()


def test_round_robin_2_processos() -> None:
    processos = [
        {"id": "p1", "nome": "P1", "duracao": 6, "prioridade": 1},
        {"id": "p2", "nome": "P2", "duracao": 4, "prioridade": 1},
    ]
    resultado = simular_escalonador(processos, "round-robin", quantum=4)
    assert resultado["algoritmo"] == "round-robin"
    assert resultado["tempo_total"] == 10
    gantt = resultado["gantt"]
    assert isinstance(gantt, list)
    assert len(gantt) == 3


def test_prioridade_ordena_por_prioridade() -> None:
    processos = [
        {"id": "p1", "nome": "P1", "duracao": 3, "prioridade": 5},
        {"id": "p2", "nome": "P2", "duracao": 2, "prioridade": 1},
        {"id": "p3", "nome": "P3", "duracao": 4, "prioridade": 3},
    ]
    resultado = simular_escalonador(processos, "prioridade")
    gantt = resultado["gantt"]
    assert isinstance(gantt, list)
    assert gantt[0]["processo_id"] == "p2"
    assert gantt[1]["processo_id"] == "p3"
    assert gantt[2]["processo_id"] == "p1"


def test_prioridade_com_quantum_fatia_processos_longos() -> None:
    processos = [
        {"id": "p1", "nome": "P1", "duracao": 6, "prioridade": 3},
        {"id": "p2", "nome": "P2", "duracao": 4, "prioridade": 1},
        {"id": "p3", "nome": "P3", "duracao": 8, "prioridade": 5},
    ]
    resultado = simular_escalonador(processos, "prioridade", quantum=4)
    gantt = resultado["gantt"]
    assert isinstance(gantt, list)
    assert resultado["tempo_total"] == 18
    assert gantt[0]["processo_id"] == "p2"
    assert gantt[1]["processo_id"] == "p1"
    assert gantt[2]["processo_id"] == "p1"
    assert gantt[3]["processo_id"] == "p3"
    assert gantt[4]["processo_id"] == "p3"


def test_algoritmo_invalido_levanta_excecao() -> None:
    with pytest.raises(ValueError):
        simular_escalonador([], "sjf")
