import json
import pytest
from django.test import Client


@pytest.fixture
def client() -> Client:
    return Client()


def test_round_robin_retorna_200_com_gantt(client: Client) -> None:
    payload = {
        "algoritmo": "round-robin",
        "quantum": 4,
        "processos": [
            {"id": "p1", "nome": "P1", "duracao": 6, "prioridade": 1},
            {"id": "p2", "nome": "P2", "duracao": 4, "prioridade": 1},
        ],
    }
    res = client.post(
        "/api/escalonador/simular/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["algoritmo"] == "round-robin"
    assert isinstance(data["gantt"], list)
    assert data["tempo_total"] == 10


def test_prioridade_retorna_200(client: Client) -> None:
    payload = {
        "algoritmo": "prioridade",
        "processos": [
            {"id": "p1", "nome": "P1", "duracao": 3, "prioridade": 5},
            {"id": "p2", "nome": "P2", "duracao": 2, "prioridade": 1},
        ],
    }
    res = client.post(
        "/api/escalonador/simular/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["gantt"][0]["processo_id"] == "p2"


def test_processos_invalidos_retorna_400(client: Client) -> None:
    payload = {"algoritmo": "round-robin", "processos": []}
    res = client.post(
        "/api/escalonador/simular/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 400
