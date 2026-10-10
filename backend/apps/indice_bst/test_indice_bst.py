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
    assert len(data["passos_busca"]) == 3


def test_bst_envelope_de_passos_cobre_insercao_e_busca(client: Client) -> None:
    res = client.post(
        "/api/bst/simular/",
        data=json.dumps({"valores": [50, 30, 70], "alvo": 30}),
        content_type="application/json",
    )
    assert res.status_code == 200
    data = res.json()
    passos = data["passos"]
    assert isinstance(passos, list) and len(passos) > 0
    for p in passos:
        assert set(p.keys()) >= {"indice", "descricao", "destaques", "estado"}
    assert data["passos_busca"] == [
        {"no": 50, "comparacao": "menor"},
        {"no": 30, "comparacao": "igual"},
    ]


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
