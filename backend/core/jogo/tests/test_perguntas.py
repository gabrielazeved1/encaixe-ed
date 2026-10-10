import itertools
from random import Random

import pytest

from core.jogo.perguntas import BANCO, ESTRUTURAS, CAMADAS, Pergunta, montar_pergunta


def test_banco_cobre_todas_combinacoes():
    assert set(BANCO.keys()) == set(itertools.product(ESTRUTURAS, CAMADAS))


def test_cada_combinacao_tem_pelo_menos_2_enunciados():
    for chave, lista in BANCO.items():
        assert len(lista) >= 2, f"{chave} tem só {len(lista)} enunciado(s)"


def test_toda_pergunta_tem_4_alternativas_e_indice_valido():
    for lista in BANCO.values():
        for p in lista:
            assert len(p.alternativas) == 4
            assert 0 <= p.indice_correto < 4


PROIBIDAS = [
    "pilha", "fila", "heap", "hash", "bst", "linkedlist", "grafo",
    "stack", "queue", "monte", "árvore binária", "árvore de busca",
    "lista encadeada", "lista ligada", "tabela hash", "tabela de dispersão",
    "dijkstra", "bfs", "dfs",
]


def test_enunciados_de_camada_estrutura_passam_na_varredura_de_neutralidade():
    for (estrutura, camada), lista in BANCO.items():
        if camada != "estrutura":
            continue
        for p in lista:
            texto = p.enunciado.lower()
            for proibida in PROIBIDAS:
                assert proibida not in texto, (
                    f"({estrutura}, estrutura): enunciado '{p.enunciado}' "
                    f"contém termo proibido '{proibida}'"
                )


def test_montar_pergunta_e_deterministico_dada_mesma_seed():
    p1 = montar_pergunta("heap", "push_sift", "estrutura", Random(42))
    p2 = montar_pergunta("heap", "push_sift", "estrutura", Random(42))
    assert p1 == p2


def test_montar_pergunta_embaralha_alternativas():
    original = BANCO[("heap", "estrutura")][0]
    diffs = 0
    for seed in range(10):
        resultado = montar_pergunta("heap", "push_sift", "estrutura", Random(seed))
        if resultado.alternativas != original.alternativas:
            diffs += 1
    assert diffs >= 5


def test_montar_pergunta_preserva_resposta_correta_apos_shuffle():
    for seed in range(20):
        for (estrutura, camada) in [("heap", "estrutura"), ("pilha", "operacao"), ("grafo", "complexidade")]:
            op_nome = {"heap": "push_sift", "pilha": "push_pop", "grafo": "dijkstra_4nos"}[estrutura]
            resultado = montar_pergunta(estrutura, op_nome, camada, Random(seed))
            correta = resultado.alternativas[resultado.indice_correto]
            assert isinstance(correta, str) and correta.strip()


def test_pergunta_dataclass_frozen():
    p = Pergunta(
        camada="estrutura",
        enunciado="x",
        alternativas=("a", "b", "c", "d"),
        indice_correto=0,
    )
    with pytest.raises(Exception):
        p.indice_correto = 1  # type: ignore[misc]
