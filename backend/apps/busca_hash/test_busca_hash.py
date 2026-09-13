import json
import pytest
from django.test import Client


@pytest.fixture
def client() -> Client:
    return Client()


def test_busca_retorna_200_com_comparacoes(client: Client) -> None:
    res = client.post(
        "/api/hash/comparar/",
        data=json.dumps({"chave": "registro_010"}),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert "linear" in data
    assert "hash" in data
    assert data["linear"]["encontrado"] is True


def test_hash_usa_menos_comparacoes_que_linear(client: Client) -> None:
    res = client.post(
        "/api/hash/comparar/",
        data=json.dumps({"chave": "registro_015"}),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["hash"]["comparacoes"] <= data["linear"]["comparacoes"]


def test_chave_vazia_retorna_400(client: Client) -> None:
    res = client.post(
        "/api/hash/comparar/",
        data=json.dumps({"chave": ""}),
        content_type="application/json",
    )
    assert res.status_code == 400
