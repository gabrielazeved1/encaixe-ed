from dataclasses import dataclass
from random import Random
from typing import Callable

from core.estruturas.bst import BST
from core.estruturas.graph import Graph
from core.estruturas.hash_table import HashTable
from core.estruturas.linked_list import LinkedList
from core.estruturas.passos import Passo, PassoColetor, fazer_passo
from core.estruturas.queue import Queue
from core.estruturas.stack import Stack


@dataclass(frozen=True)
class OperacaoJogavel:
    estrutura: str
    nome: str
    executar: Callable[[Random], list[Passo]]
    nome_tecnico: str
    invariante: str
    complexidade_pior: str


def _pilha_push_pop(rng: Random) -> list[Passo]:
    passos: PassoColetor = []
    s: Stack[int] = Stack()
    valores = [rng.randint(1, 99) for _ in range(3)]
    for v in valores:
        s.push(v)
        fazer_passo(
            passos,
            f"insiro {v} no topo",
            ["topo"],
            {"elementos": s.snapshot()},
        )
    removido = s.pop()
    fazer_passo(
        passos,
        f"removo {removido} do topo",
        ["topo"],
        {"elementos": s.snapshot()},
    )
    return passos


def _fila_enqueue_dequeue(rng: Random) -> list[Passo]:
    passos: PassoColetor = []
    q: Queue[int] = Queue()
    valores = [rng.randint(1, 99) for _ in range(3)]
    for v in valores:
        q.enqueue(v)
        fazer_passo(
            passos,
            f"insiro {v} no fim",
            ["fim"],
            {"elementos": q.snapshot()},
        )
    removido = q.dequeue()
    fazer_passo(
        passos,
        f"removo {removido} do início",
        ["inicio"],
        {"elementos": q.snapshot()},
    )
    return passos


def _heap_push_sift(rng: Random) -> list[Passo]:
    passos: PassoColetor = []
    data: list[int] = []

    def _snap() -> dict:
        return {"arranjo": list(data)}

    for _ in range(4):
        v = rng.randint(1, 99)
        data.append(v)
        idx = len(data) - 1
        fazer_passo(
            passos,
            f"insiro {v} na próxima posição livre (índice {idx})",
            [f"indice:{idx}"],
            _snap(),
        )
        while idx > 0:
            pai = (idx - 1) // 2
            if data[idx] < data[pai]:
                fazer_passo(
                    passos,
                    f"{data[idx]} é menor que o pai no índice {pai} ({data[pai]}) → troco de lugar",
                    [f"indice:{idx}", f"indice:{pai}"],
                    _snap(),
                )
                data[idx], data[pai] = data[pai], data[idx]
                idx = pai
            else:
                fazer_passo(
                    passos,
                    f"{data[idx]} não é menor que o pai no índice {pai} ({data[pai]}) → paro",
                    [f"indice:{idx}", f"indice:{pai}"],
                    _snap(),
                )
                break
    return passos


def _hash_inserir_colidir_buscar(rng: Random) -> list[Passo]:
    passos: PassoColetor = []
    tamanho = 8
    ht = HashTable(tamanho=tamanho)

    def _h(s: str) -> int:
        h = 0
        for c in s:
            h = (h * 31 + ord(c)) % tamanho
        return h

    alfabeto = "abcdefgijklmnopqrstuvwxyz"
    candidatos: list[str] = []
    for _ in range(200):
        k = "".join(rng.choice(alfabeto) for _ in range(3))
        candidatos.append(k)

    por_bucket: dict[int, list[str]] = {}
    for c in candidatos:
        por_bucket.setdefault(_h(c), []).append(c)

    buckets_cheios = sorted(
        b for b, ks in por_bucket.items() if len(set(ks)) >= 3
    )
    if not buckets_cheios:
        raise RuntimeError("sem colisão suficiente — aumentar amostra")
    bucket = buckets_cheios[rng.randint(0, len(buckets_cheios) - 1)]

    chaves: list[str] = []
    for k in por_bucket[bucket]:
        if k not in chaves:
            chaves.append(k)
        if len(chaves) == 3:
            break

    for k in chaves:
        ht.inserir(k, rng.randint(1, 99), passos)

    ht.buscar(chaves[1], passos)
    return passos


def _bst_inserir_buscar(rng: Random) -> list[Passo]:
    passos: PassoColetor = []
    bst = BST()
    valores = rng.sample(range(10, 90), 5)
    for v in valores:
        bst.inserir(v, passos)
    alvo = rng.choice(valores)
    bst.buscar(alvo, passos)
    return passos


def _linkedlist_push_insert_remove(rng: Random) -> list[Passo]:
    passos: PassoColetor = []
    ll: LinkedList[int] = LinkedList()

    def _snap() -> dict:
        return {"elementos": list(ll)}

    for _ in range(3):
        v = rng.randint(1, 99)
        pos = len(ll)
        ll.push(v)
        fazer_passo(
            passos,
            f"insiro {v} no final (posição {pos})",
            [f"pos:{pos}"],
            _snap(),
        )

    pos_ins = rng.randint(0, len(ll))
    v_ins = rng.randint(1, 99)
    for p in range(pos_ins):
        fazer_passo(
            passos,
            f"percorro até a posição {p}",
            [f"pos:{p}"],
            _snap(),
        )
    ll.insert_at(pos_ins, v_ins)
    fazer_passo(
        passos,
        f"insiro {v_ins} na posição {pos_ins}",
        [f"pos:{pos_ins}"],
        _snap(),
    )

    pos_rem = rng.randint(0, len(ll) - 1)
    for p in range(pos_rem):
        fazer_passo(
            passos,
            f"percorro até a posição {p}",
            [f"pos:{p}"],
            _snap(),
        )
    removido = ll.remove_at(pos_rem)
    fazer_passo(
        passos,
        f"removo {removido} da posição {pos_rem}",
        [f"pos:{pos_rem}"],
        _snap(),
    )
    return passos


def _grafo_dijkstra_4nos(rng: Random) -> list[Passo]:
    passos: PassoColetor = []
    g = Graph()
    g.add_aresta("A", "B", 1)
    g.add_aresta("A", "C", 4)
    g.add_aresta("B", "C", 2)
    g.add_aresta("C", "D", 1)
    g.add_aresta("B", "D", 5)
    resultado = g.dijkstra("A", "D")
    raw = resultado["passos"]
    assert isinstance(raw, list)
    for p in raw:
        if "tipo" in p and p.get("tipo") == "relaxamento":
            fazer_passo(
                passos,
                str(p["descricao"]),
                [str(d) for d in p["destaques"]],
                p["estado"],
            )
        else:
            no = p["no"]
            via = p["via"]
            custo = p["custo_acumulado"]
            if via is None:
                fazer_passo(
                    passos,
                    f"começo em {no} com custo {custo}",
                    [f"no:{no}"],
                    {"visitado": no, "custo": custo},
                )
            else:
                fazer_passo(
                    passos,
                    f"visito {no} vindo pela aresta {via}-{no} com custo {custo}",
                    [f"no:{no}", f"aresta:{via}-{no}"],
                    {"visitado": no, "custo": custo, "via": via},
                )
    return passos


OPERACOES: dict[str, list[OperacaoJogavel]] = {
    "pilha": [
        OperacaoJogavel(
            estrutura="pilha",
            nome="push_pop",
            executar=_pilha_push_pop,
            nome_tecnico="push + pop",
            invariante="LIFO: o último elemento inserido é o primeiro a ser removido.",
            complexidade_pior="O(1)",
        )
    ],
    "fila": [
        OperacaoJogavel(
            estrutura="fila",
            nome="enqueue_dequeue",
            executar=_fila_enqueue_dequeue,
            nome_tecnico="enqueue + dequeue",
            invariante="FIFO: o primeiro elemento inserido é o primeiro a ser removido.",
            complexidade_pior="O(1)",
        )
    ],
    "heap": [
        OperacaoJogavel(
            estrutura="heap",
            nome="push_sift",
            executar=_heap_push_sift,
            nome_tecnico="SIFT-UP (percolate-up)",
            invariante="Em um min-heap, todo pai é menor ou igual a seus filhos.",
            complexidade_pior="O(log n)",
        )
    ],
    "hash": [
        OperacaoJogavel(
            estrutura="hash",
            nome="inserir_colidir_buscar",
            executar=_hash_inserir_colidir_buscar,
            nome_tecnico="encadeamento separado + busca",
            invariante="Chaves com mesma função de dispersão compartilham o mesmo bucket por encadeamento.",
            complexidade_pior="O(n)",
        )
    ],
    "bst": [
        OperacaoJogavel(
            estrutura="bst",
            nome="inserir_buscar",
            executar=_bst_inserir_buscar,
            nome_tecnico="busca binária em árvore (pior caso degenerado)",
            invariante="Para todo nó, a subárvore esquerda contém chaves menores e a direita, chaves maiores.",
            complexidade_pior="O(n)",
        )
    ],
    "linkedlist": [
        OperacaoJogavel(
            estrutura="linkedlist",
            nome="push_insert_remove",
            executar=_linkedlist_push_insert_remove,
            nome_tecnico="insert_at / remove_at (posição arbitrária)",
            invariante="Cada nó referencia o próximo; acesso por índice requer travessia sequencial.",
            complexidade_pior="O(n)",
        )
    ],
    "grafo": [
        OperacaoJogavel(
            estrutura="grafo",
            nome="dijkstra_4nos",
            executar=_grafo_dijkstra_4nos,
            nome_tecnico="Dijkstra (via fila de prioridade)",
            invariante="A cada iteração, extrai-se o vértice de menor custo acumulado e relaxam-se suas arestas.",
            complexidade_pior="O((V+E) log V)",
        )
    ],
}
