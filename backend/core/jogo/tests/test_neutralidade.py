import pytest

from core.jogo.neutralidade import PROIBIDAS, VazamentoDeNome, varredura_neutra
from core.jogo.operacoes import OPERACOES
from random import Random


def test_varredura_aceita_passos_neutros():
    passos = [
        {
            "indice": 0,
            "descricao": "insiro 7 no topo",
            "destaques": ["topo"],
            "estado": {"elementos": [7]},
        }
    ]
    varredura_neutra(passos)


def test_varredura_detecta_palavra_proibida_na_descricao():
    passos = [
        {
            "indice": 0,
            "descricao": "empurrei na pilha",
            "destaques": ["topo"],
            "estado": {},
        }
    ]
    with pytest.raises(VazamentoDeNome):
        varredura_neutra(passos)


def test_varredura_e_case_insensitive():
    passos = [
        {
            "indice": 0,
            "descricao": "HEAP cheio",
            "destaques": [],
            "estado": {},
        }
    ]
    with pytest.raises(VazamentoDeNome):
        varredura_neutra(passos)


def test_varredura_detecta_palavra_nos_destaques():
    passos = [
        {
            "indice": 0,
            "descricao": "algo",
            "destaques": ["dijkstra:A"],
            "estado": {},
        }
    ]
    with pytest.raises(VazamentoDeNome):
        varredura_neutra(passos)


def test_varredura_detecta_palavra_no_estado():
    passos = [
        {
            "indice": 0,
            "descricao": "algo",
            "destaques": [],
            "estado": {"nome": "lista encadeada"},
        }
    ]
    with pytest.raises(VazamentoDeNome):
        varredura_neutra(passos)


def test_proibidas_contem_as_7_estruturas():
    nomes = {"pilha", "fila", "heap", "hash", "bst", "linkedlist", "grafo"}
    assert nomes.issubset(PROIBIDAS)


@pytest.mark.parametrize("seed", range(100))
def test_todas_operacoes_sao_neutras_para_100_seeds(seed):
    rng = Random(seed)
    for estrutura, lista in OPERACOES.items():
        for op in lista:
            passos = op.executar(Random(seed))
            varredura_neutra(passos)
