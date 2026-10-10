from core.jogo.operacoes import OPERACOES

PIOR_CASO: dict[tuple[str, str], str] = {
    ("pilha", "push_pop"): "O(1)",
    ("fila", "enqueue_dequeue"): "O(1)",
    ("heap", "push_sift"): "O(log n)",
    ("hash", "inserir_colidir_buscar"): "O(n)",
    ("bst", "inserir_buscar"): "O(n)",
    ("linkedlist", "push_insert_remove"): "O(n)",
    ("grafo", "dijkstra_4nos"): "O((V+E) log V)",
}


def pior_caso(estrutura: str, operacao: str) -> str:
    if estrutura not in OPERACOES:
        raise KeyError(f"estrutura desconhecida: {estrutura}")
    if (estrutura, operacao) not in PIOR_CASO:
        raise KeyError(f"operação desconhecida para {estrutura}: {operacao}")
    return PIOR_CASO[(estrutura, operacao)]
