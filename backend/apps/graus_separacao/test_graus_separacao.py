import json
import pytest
from django.test import Client


@pytest.fixture
def client() -> Client:
    return Client()


PESSOAS = [
    {"id": "a", "nome": "Ana"},
    {"id": "b", "nome": "Bruno"},
    {"id": "c", "nome": "Carlos"},
    {"id": "d", "nome": "Diana"},
]


def test_bfs_retorna_200_com_graus(client: Client) -> None:
    payload = {
        "pessoas": PESSOAS,
        "amizades": [
            {"a": "a", "b": "b"},
            {"a": "b", "b": "c"},
            {"a": "c", "b": "d"},
        ],
        "origem": "a",
        "destino": "d",
    }
    res = client.post(
        "/api/graus/bfs/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["graus"] == 3
    assert data["nomes_caminho"] == ["Ana", "Bruno", "Carlos", "Diana"]


def test_sem_conexao_retorna_graus_menos_1(client: Client) -> None:
    payload = {
        "pessoas": PESSOAS,
        "amizades": [{"a": "a", "b": "b"}],
        "origem": "a",
        "destino": "d",
    }
    res = client.post(
        "/api/graus/bfs/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["graus"] == -1


def test_origem_invalida_retorna_400(client: Client) -> None:
    payload = {
        "pessoas": PESSOAS,
        "amizades": [],
        "origem": "z",
        "destino": "b",
    }
    res = client.post(
        "/api/graus/bfs/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 400
