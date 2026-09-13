import json
import pytest
from django.test import Client


@pytest.fixture
def client() -> Client:
    return Client()


def test_bst_retorna_200_com_passos(client: Client) -> None:
    res = client.post(
        "/api/bst/simular/",
        data=json.dumps({"valores": [8, 4, 12, 2, 6, 10, 14], "alvo": 6}),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["encontrado"] is True
    assert len(data["passos"]) == 3


def test_bst_valor_nao_encontrado(client: Client) -> None:
    res = client.post(
        "/api/bst/simular/",
        data=json.dumps({"valores": [8, 4, 12], "alvo": 99}),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["encontrado"] is False


def test_lista_vazia_retorna_400(client: Client) -> None:
    res = client.post(
        "/api/bst/simular/",
        data=json.dumps({"valores": [], "alvo": 5}),
        content_type="application/json",
    )
    assert res.status_code == 400
