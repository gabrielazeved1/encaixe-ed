import json

from core.estruturas.passos import Passo


PROIBIDAS: frozenset[str] = frozenset(
    {
        "pilha",
        "stack",
        "fila",
        "queue",
        "heap",
        "monte",
        "hash",
        "tabela hash",
        "bst",
        "árvore binária",
        "arvore binaria",
        "linkedlist",
        "linked list",
        "lista encadeada",
        "grafo",
        "graph",
        "dijkstra",
        "bfs",
    }
)


class VazamentoDeNome(Exception):
    pass


def varredura_neutra(passos: list[Passo]) -> None:
    partes: list[str] = []
    for p in passos:
        partes.append(str(p["descricao"]))
        partes.extend(str(d) for d in p["destaques"])
        partes.append(json.dumps(p["estado"], ensure_ascii=False, default=str))
    texto = " ".join(partes).lower()
    for palavra in PROIBIDAS:
        if palavra in texto:
            raise VazamentoDeNome(f"substring proibida encontrada: {palavra!r}")


def varredura_neutra_texto(texto: str) -> None:
    alvo = texto.lower()
    for palavra in PROIBIDAS:
        if palavra in alvo:
            raise VazamentoDeNome(f"substring proibida encontrada: {palavra!r}")
