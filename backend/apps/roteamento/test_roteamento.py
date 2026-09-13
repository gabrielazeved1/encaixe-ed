import json
import pytest
from django.test import Client


@pytest.fixture
def client() -> Client:
    return Client()


def test_dijkstra_retorna_200_com_caminho(client: Client) -> None:
    payload = {
        "nos": ["A", "B", "C"],
        "arestas": [
            {"origem": "A", "destino": "B", "custo": 1},
            {"origem": "B", "destino": "C", "custo": 2},
            {"origem": "A", "destino": "C", "custo": 10},
        ],
        "origem": "A",
        "destino": "C",
    }
    res = client.post(
        "/api/roteamento/calcular/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["caminho"] == ["A", "B", "C"]
    assert data["custo_total"] == 3


def test_no_invalido_retorna_400(client: Client) -> None:
    payload = {
        "nos": ["A", "B"],
        "arestas": [],
        "origem": "X",
        "destino": "B",
    }
    res = client.post(
        "/api/roteamento/calcular/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 400


def test_sem_caminho_retorna_caminho_vazio(client: Client) -> None:
    payload = {
        "nos": ["A", "B"],
        "arestas": [],
        "origem": "A",
        "destino": "B",
    }
    res = client.post(
        "/api/roteamento/calcular/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["caminho"] == []
    assert data["custo_total"] == -1
