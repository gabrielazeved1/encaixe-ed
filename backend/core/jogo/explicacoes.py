EXPLICACOES: dict[str, str] = {
    "pilha": (
        "A mecânica LIFO (último a entrar, primeiro a sair) é visível porque cada "
        "inserção e cada remoção acontecem sempre no 'topo' — nenhum outro ponto da "
        "estrutura é tocado."
    ),
    "fila": (
        "A mecânica FIFO fica clara pela assimetria: inserções acontecem no 'fim' e "
        "remoções no 'início'. Nenhuma estrutura simétrica (que entra e sai pelo mesmo "
        "lado) se comportaria assim."
    ),
    "heap": (
        "Depois de inserir no índice livre, o novo valor sobe trocando com o pai sempre "
        "que for menor. Essas trocas pai-filho (sift-up) são o fingerprint da estrutura."
    ),
    "hash": (
        "Chaves diferentes caem no mesmo bucket (colisão) e são comparadas uma a uma "
        "dentro desse bucket. Essa combinação — pulo direto para um bucket + varredura "
        "linear interna — não aparece em nenhuma outra das sete."
    ),
    "bst": (
        "A cada passo descemos para a esquerda ou para a direita comparando com o nó "
        "atual (menor vai à esquerda, maior à direita). Essa divisão binária guiada por "
        "ordem é o traço clássico."
    ),
    "linkedlist": (
        "Para chegar na posição N precisamos percorrer passo a passo da cabeça até lá — "
        "acesso linear por posição, sem salto direto, é o que denuncia a estrutura."
    ),
    "grafo": (
        "Dijkstra: cada aresta vizinha do nó recém-visitado é relaxada — se o novo custo "
        "melhora o conhecido, atualizamos a distância. Esse padrão de 'visito, relaxo "
        "vizinhos, repito pelo menor custo' só existe em grafos ponderados."
    ),
}
