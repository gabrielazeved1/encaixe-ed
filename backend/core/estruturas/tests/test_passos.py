import json

import pytest

from core.estruturas.passos import PassoColetor, fazer_passo


def test_indice_denso_comeca_em_zero():
    coletor: PassoColetor = []
    fazer_passo(coletor, "primeiro", [], None)
    fazer_passo(coletor, "segundo", ["x:1"], {"n": 1})
    fazer_passo(coletor, "terceiro", [], None)

    assert [p["indice"] for p in coletor] == [0, 1, 2]


def test_descricao_vazia_falha():
    coletor: PassoColetor = []
    with pytest.raises(AssertionError):
        fazer_passo(coletor, "", [], None)


def test_passo_e_json_serializavel():
    coletor: PassoColetor = []
    fazer_passo(
        coletor,
        "estado complexo",
        ["bucket:3", "no:50"],
        {"tamanho": 16, "buckets": [[("ana", 1)], []]},
    )
    serializado = json.dumps(coletor[0])
    recarregado = json.loads(serializado)

    assert recarregado["indice"] == 0
    assert recarregado["descricao"] == "estado complexo"
    assert recarregado["destaques"] == ["bucket:3", "no:50"]


def test_destaques_sao_copiados_nao_referenciados():
    coletor: PassoColetor = []
    destaques_originais = ["no:1"]
    fazer_passo(coletor, "ok", destaques_originais, None)
    destaques_originais.append("no:2")

    assert coletor[0]["destaques"] == ["no:1"]
