import json
from random import Random

import pytest

from core.jogo.operacoes import OPERACOES


def _rng() -> Random:
    return Random(0)


def _texto(passos) -> str:
    partes: list[str] = []
    for p in passos:
        partes.append(p["descricao"])
        partes.extend(p["destaques"])
        partes.append(json.dumps(p["estado"], ensure_ascii=False, default=str))
    return " ".join(partes).lower()


def _destaques_de(passos) -> list[str]:
    out: list[str] = []
    for p in passos:
        out.extend(p["destaques"])
    return out


@pytest.mark.parametrize("estrutura", list(OPERACOES.keys()))
def test_toda_operacao_produz_pelo_menos_2_passos(estrutura):
    for op in OPERACOES[estrutura]:
        passos = op.executar(_rng())
        assert len(passos) >= 2


def test_pilha_push_pop_destaque_topo():
    for op in OPERACOES["pilha"]:
        passos = op.executar(_rng())
        assert any("topo" in d for d in _destaques_de(passos))


def test_fila_enqueue_dequeue_destaque_inicio_ou_fim():
    for op in OPERACOES["fila"]:
        passos = op.executar(_rng())
        destaques = _destaques_de(passos)
        assert any(d == "fim" for d in destaques)
        assert any(d == "inicio" for d in destaques)


def test_heap_push_mostra_indices():
    for op in OPERACOES["heap"]:
        passos = op.executar(_rng())
        destaques = _destaques_de(passos)
        assert any(d.startswith("indice:") for d in destaques)


def test_hash_colisao_mostra_bucket():
    for op in OPERACOES["hash"]:
        passos = op.executar(_rng())
        destaques = _destaques_de(passos)
        assert any(d.startswith("bucket:") for d in destaques)


def test_bst_mostra_no():
    for op in OPERACOES["bst"]:
        passos = op.executar(_rng())
        destaques = _destaques_de(passos)
        assert any(d.startswith("no:") for d in destaques)
        texto = _texto(passos)
        assert "esquerda" in texto or "direita" in texto


def test_linkedlist_mostra_pos():
    for op in OPERACOES["linkedlist"]:
        passos = op.executar(_rng())
        destaques = _destaques_de(passos)
        assert any(d.startswith("pos:") for d in destaques)


def test_grafo_dijkstra_mostra_aresta():
    for op in OPERACOES["grafo"]:
        passos = op.executar(_rng())
        destaques = _destaques_de(passos)
        assert any(d.startswith("aresta:") for d in destaques)


def test_7_estruturas_tem_pelo_menos_uma_operacao():
    assert set(OPERACOES.keys()) == {
        "pilha",
        "fila",
        "heap",
        "hash",
        "bst",
        "linkedlist",
        "grafo",
    }
    for lista in OPERACOES.values():
        assert len(lista) >= 1


def test_operacao_deterministica_com_mesma_seed():
    for estrutura, lista in OPERACOES.items():
        for op in lista:
            p1 = op.executar(Random(123))
            p2 = op.executar(Random(123))
            assert p1 == p2, f"{estrutura}/{op.nome} não é determinística"


COMPLEXIDADES_VALIDAS = {
    "O(1)",
    "O(log n)",
    "O(n)",
    "O(n log n)",
    "O(n²)",
    "O((V+E) log V)",
}


def test_cada_operacao_tem_nome_tecnico_nao_vazio():
    for lista in OPERACOES.values():
        for op in lista:
            assert isinstance(op.nome_tecnico, str) and op.nome_tecnico.strip()


def test_cada_operacao_tem_invariante_nao_vazio():
    for lista in OPERACOES.values():
        for op in lista:
            assert isinstance(op.invariante, str) and op.invariante.strip()


def test_cada_operacao_tem_complexidade_pior_valida():
    for lista in OPERACOES.values():
        for op in lista:
            assert op.complexidade_pior in COMPLEXIDADES_VALIDAS
