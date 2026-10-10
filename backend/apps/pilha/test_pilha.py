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


def test_resposta_inclui_envelope_de_passos(client: Client) -> None:
    res = client.post(
        "/api/pilha/simular/",
        data=json.dumps({"funcao": "fatorial", "valor": 3}),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    passos = data["passos"]
    assert isinstance(passos, list)
    assert len(passos) > 0
    for i, p in enumerate(passos):
        assert p["indice"] == i
        assert isinstance(p["descricao"], str) and p["descricao"]
        assert isinstance(p["destaques"], list)
        assert "estado" in p
