import json
import pytest
from django.test import Client


@pytest.fixture
def client() -> Client:
    return Client()


def test_alocar_retorna_200_com_estados(client: Client) -> None:
    payload = {
        "operacoes": [
            {"tipo": "alocar", "tamanho": 64},
            {"tipo": "alocar", "tamanho": 128},
        ]
    }
    res = client.post(
        "/api/memoria/simular/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_operacoes"] == 2
    assert len(data["estados"]) == 2


def test_liberar_aumenta_livre(client: Client) -> None:
    payload = {
        "operacoes": [
            {"tipo": "alocar", "tamanho": 64},
            {"tipo": "liberar", "bloco_id": 0},
        ]
    }
    res = client.post(
        "/api/memoria/simular/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    depois = data["estados"][-1]
    assert depois["livre_total"] == 512


def test_operacao_invalida_retorna_400(client: Client) -> None:
    payload = {"operacoes": [{"tipo": "alocar"}]}
    res = client.post(
        "/api/memoria/simular/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 400
