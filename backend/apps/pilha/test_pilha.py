import json
import pytest
from django.test import Client


@pytest.fixture
def client() -> Client:
    return Client()


def test_fatorial_retorna_200_com_frames(client: Client) -> None:
    res = client.post(
        "/api/pilha/simular/",
        data=json.dumps({"funcao": "fatorial", "valor": 4}),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "completo"
    assert len(data["frames"]) == 8


def test_valor_invalido_retorna_400(client: Client) -> None:
    res = client.post(
        "/api/pilha/simular/",
        data=json.dumps({"funcao": "fatorial", "valor": -1}),
        content_type="application/json",
    )
    assert res.status_code == 400


def test_funcao_invalida_retorna_400(client: Client) -> None:
    res = client.post(
        "/api/pilha/simular/",
        data=json.dumps({"funcao": "mergesort", "valor": 5}),
        content_type="application/json",
    )
    assert res.status_code == 400


def test_fibonacci_grande_retorna_overflow_com_status_correto(client: Client) -> None:
    res = client.post(
        "/api/pilha/simular/",
        data=json.dumps({"funcao": "fibonacci", "valor": 100}),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "overflow"
    assert data["frames"][-1]["tipo"] == "overflow"
