from dataclasses import dataclass
from random import Random
from typing import Literal

Camada = Literal["estrutura", "operacao", "complexidade"]

ESTRUTURAS: tuple[str, ...] = (
    "pilha", "fila", "heap", "hash", "bst", "linkedlist", "grafo",
)
CAMADAS: tuple[Camada, ...] = ("estrutura", "operacao", "complexidade")


@dataclass(frozen=True)
class Pergunta:
    camada: Camada
    enunciado: str
    alternativas: tuple[str, str, str, str]
    indice_correto: int


ALT_ESTRUTURA = {
    "pilha": (
        "Pilha (estrutura LIFO)",
        "Fila (estrutura FIFO)",
        "Lista duplamente encadeada",
        "Árvore binária de busca",
    ),
    "fila": (
        "Fila (estrutura FIFO)",
        "Pilha (estrutura LIFO)",
        "Fila de prioridade implementada como monte binário",
        "Lista duplamente encadeada",
    ),
    "heap": (
        "Fila de prioridade implementada como monte binário",
        "Árvore binária de busca balanceada",
        "Lista duplamente encadeada ordenada",
        "Tabela de dispersão com encadeamento separado",
    ),
    "hash": (
        "Tabela de dispersão com encadeamento separado",
        "Árvore binária de busca",
        "Fila de prioridade implementada como monte binário",
        "Lista duplamente encadeada ordenada",
    ),
    "bst": (
        "Árvore binária de busca",
        "Fila de prioridade implementada como monte binário",
        "Lista duplamente encadeada ordenada",
        "Tabela de dispersão com encadeamento separado",
    ),
    "linkedlist": (
        "Lista duplamente encadeada",
        "Arranjo dinâmico com cópia na expansão",
        "Árvore binária de busca",
        "Fila de prioridade implementada como monte binário",
    ),
    "grafo": (
        "Grafo ponderado dirigido",
        "Árvore binária de busca balanceada",
        "Floresta de árvores enraizadas",
        "Fila de prioridade implementada como monte binário",
    ),
}

ALT_OPERACAO = {
    "pilha": (
        "push + pop (inserção e remoção no topo)",
        "enqueue + dequeue (inserção no fim, remoção no início)",
        "SIFT-UP (percolate-up)",
        "busca binária em árvore",
    ),
    "fila": (
        "enqueue + dequeue (inserção no fim, remoção no início)",
        "push + pop (inserção e remoção no topo)",
        "insert_at / remove_at (posição arbitrária)",
        "encadeamento separado + busca",
    ),
    "heap": (
        "SIFT-UP (percolate-up)",
        "SIFT-DOWN (percolate-down)",
        "HEAPIFY (ou BUILD-HEAP)",
        "EXTRACT-MIN sem reposicionamento",
    ),
    "hash": (
        "encadeamento separado + busca",
        "endereçamento aberto com sondagem linear",
        "SIFT-UP (percolate-up)",
        "busca binária em árvore",
    ),
    "bst": (
        "busca binária em árvore (pior caso degenerado)",
        "SIFT-UP (percolate-up)",
        "encadeamento separado + busca",
        "Dijkstra (via fila de prioridade)",
    ),
    "linkedlist": (
        "insert_at / remove_at (posição arbitrária)",
        "push + pop (inserção e remoção no topo)",
        "SIFT-DOWN (percolate-down)",
        "busca binária em árvore",
    ),
    "grafo": (
        "Dijkstra (via fila de prioridade)",
        "Busca em largura (BFS)",
        "Busca em profundidade (DFS)",
        "Prim (árvore geradora mínima)",
    ),
}

ALT_COMPLEXIDADE_DEFAULT = ("O(1)", "O(log n)", "O(n)", "O(n log n)")
ALT_COMPLEXIDADE_GRAFO = ("O(V+E)", "O((V+E) log V)", "O(V²)", "O(V!)")


def _idx(alt: tuple[str, ...], valor: str) -> int:
    return alt.index(valor)


def _p(camada: Camada, enunciado: str, alts: tuple[str, ...], correta: str) -> Pergunta:
    assert len(alts) == 4
    return Pergunta(
        camada=camada,
        enunciado=enunciado,
        alternativas=(alts[0], alts[1], alts[2], alts[3]),
        indice_correto=_idx(alts, correta),
    )


BANCO: dict[tuple[str, Camada], list[Pergunta]] = {
    ("pilha", "estrutura"): [
        _p(
            "estrutura",
            "Considere uma coleção linear em que inserções e remoções ocorrem exclusivamente em uma extremidade comum. "
            "O último elemento inserido é obrigatoriamente o primeiro a ser removido. Qual estrutura de dados obedece a essa invariante?",
            ALT_ESTRUTURA["pilha"],
            "Pilha (estrutura LIFO)",
        ),
        _p(
            "estrutura",
            "Uma rotina mantém um arranjo em que o acesso é restrito a uma única ponta, e cada operação de remoção devolve exatamente o elemento inserido mais recentemente. "
            "Essa disciplina de acesso caracteriza qual estrutura?",
            ALT_ESTRUTURA["pilha"],
            "Pilha (estrutura LIFO)",
        ),
    ],
    ("pilha", "operacao"): [
        _p(
            "operacao",
            "O par de operações demonstrado — inserção em uma extremidade seguida de remoção na mesma extremidade — recebe tradicionalmente qual designação?",
            ALT_OPERACAO["pilha"],
            "push + pop (inserção e remoção no topo)",
        ),
        _p(
            "operacao",
            "Qual é a nomenclatura canônica, na literatura de ED, para o par (inserir no topo, remover do topo) empregado nesta rotina?",
            ALT_OPERACAO["pilha"],
            "push + pop (inserção e remoção no topo)",
        ),
    ],
    ("pilha", "complexidade"): [
        _p(
            "complexidade",
            "Para uma implementação por arranjo contíguo com topo explícito, qual é a complexidade de pior caso de uma única operação de inserção ou remoção?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(1)",
        ),
        _p(
            "complexidade",
            "Admitindo capacidade suficiente, qual é a complexidade de tempo assintótica no pior caso de inserir ou remover um elemento no topo da estrutura?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(1)",
        ),
    ],

    ("fila", "estrutura"): [
        _p(
            "estrutura",
            "A rotina mantém um arranjo linear com dois ponteiros — início e fim — em que inserções ocorrem em uma ponta e remoções, na oposta. "
            "O primeiro elemento inserido é o primeiro a ser removido. Qual estrutura essa disciplina caracteriza?",
            ALT_ESTRUTURA["fila"],
            "Fila (estrutura FIFO)",
        ),
        _p(
            "estrutura",
            "Uma coleção linear separa fisicamente a extremidade de inserção da extremidade de remoção, preservando a ordem relativa de entrada. "
            "A invariante correspondente é conhecida como FIFO. Qual estrutura obedece a essa invariante?",
            ALT_ESTRUTURA["fila"],
            "Fila (estrutura FIFO)",
        ),
    ],
    ("fila", "operacao"): [
        _p(
            "operacao",
            "Qual é o nome técnico do par de operações primitivas que inserem no fim e removem do início desta estrutura?",
            ALT_OPERACAO["fila"],
            "enqueue + dequeue (inserção no fim, remoção no início)",
        ),
        _p(
            "operacao",
            "O par de rotinas que respeita a disciplina FIFO — adicionar ao final, retirar do começo — é identificado na literatura por qual designação?",
            ALT_OPERACAO["fila"],
            "enqueue + dequeue (inserção no fim, remoção no início)",
        ),
    ],
    ("fila", "complexidade"): [
        _p(
            "complexidade",
            "Em uma implementação por arranjo circular (ou lista com ponteiros de início e fim), qual é a complexidade de pior caso de cada operação primitiva?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(1)",
        ),
        _p(
            "complexidade",
            "Com manutenção explícita dos ponteiros de extremidade, qual é o custo assintótico de pior caso de uma única inserção ou remoção nesta estrutura?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(1)",
        ),
    ],

    ("heap", "estrutura"): [
        _p(
            "estrutura",
            "A rotina mantém um arranjo visto como árvore implícita e, após cada inserção na próxima posição livre, "
            "promove o novo elemento por trocas sucessivas com seu antecessor enquanto a ordem parcial pai-filho estiver violada. "
            "Qual estrutura exibe essa invariante de ordem parcial?",
            ALT_ESTRUTURA["heap"],
            "Fila de prioridade implementada como monte binário",
        ),
        _p(
            "estrutura",
            "A sequência de reposicionamentos ascendentes, mantendo a relação de ordem parcial pai-filho num arranjo representado como árvore implícita, "
            "é característica de qual estrutura de dados?",
            ALT_ESTRUTURA["heap"],
            "Fila de prioridade implementada como monte binário",
        ),
    ],
    ("heap", "operacao"): [
        _p(
            "operacao",
            "O procedimento demonstrado — comparar o elemento com seu pai e trocá-los enquanto a propriedade estrutural for violada, subindo rumo à raiz — é tradicionalmente denominado:",
            ALT_OPERACAO["heap"],
            "SIFT-UP (percolate-up)",
        ),
        _p(
            "operacao",
            "A rotina de restauração da propriedade de monte após inserção na última posição, executando trocas pai-filho ascendentes, recebe na literatura o nome:",
            ALT_OPERACAO["heap"],
            "SIFT-UP (percolate-up)",
        ),
    ],
    ("heap", "complexidade"): [
        _p(
            "complexidade",
            "Dada a altura ⌊log₂ n⌋ do arranjo visto como árvore implícita quase completa, qual é a complexidade de pior caso da inserção de um elemento com reposicionamento ascendente?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(log n)",
        ),
        _p(
            "complexidade",
            "Considerando que o reposicionamento ascendente percorre no pior caso o caminho da folha até a raiz, qual é a classe de complexidade assintótica da inserção?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(log n)",
        ),
    ],

    ("hash", "estrutura"): [
        _p(
            "estrutura",
            "Uma rotina mapeia chaves para índices de um arranjo via função de dispersão; "
            "colisões são resolvidas conectando os elementos num encadeamento associado ao bucket. Qual estrutura descreve esse arranjo?",
            ALT_ESTRUTURA["hash"],
            "Tabela de dispersão com encadeamento separado",
        ),
        _p(
            "estrutura",
            "A estrutura mantém um arranjo indexado por valores obtidos de uma função determinística aplicada à chave; "
            "entradas que coincidem em índice coexistem via encadeamento. Qual estrutura obedece a essa organização?",
            ALT_ESTRUTURA["hash"],
            "Tabela de dispersão com encadeamento separado",
        ),
    ],
    ("hash", "operacao"): [
        _p(
            "operacao",
            "A estratégia demonstrada — mapear a chave por função de dispersão e, em caso de colisão, varrer uma lista acoplada ao bucket — recebe o nome:",
            ALT_OPERACAO["hash"],
            "encadeamento separado + busca",
        ),
        _p(
            "operacao",
            "Qual técnica de resolução de colisões a rotina ilustra, dado que chaves distintas que compartilham bucket são mantidas numa cadeia de nós?",
            ALT_OPERACAO["hash"],
            "encadeamento separado + busca",
        ),
    ],
    ("hash", "complexidade"): [
        _p(
            "complexidade",
            "Supondo pior caso de função de dispersão degenerada, em que todas as n chaves colidem no mesmo bucket, qual é a complexidade de uma busca?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(n)",
        ),
        _p(
            "complexidade",
            "Qual é o custo assintótico de pior caso de uma busca nesta estrutura, considerando que todas as chaves podem ser direcionadas ao mesmo bucket pela função de dispersão?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(n)",
        ),
    ],

    ("bst", "estrutura"): [
        _p(
            "estrutura",
            "A rotina insere elementos de modo que, para todo nó, chaves menores fiquem à esquerda e chaves maiores à direita, "
            "e realiza uma busca descendente comparando a chave alvo com o nó corrente. Qual estrutura descreve essa organização?",
            ALT_ESTRUTURA["bst"],
            "Árvore binária de busca",
        ),
        _p(
            "estrutura",
            "Cada nó mantém uma invariante de ordem lateral entre suas duas subárvores; a busca segue um ramo determinado pela comparação com a chave do nó. "
            "Qual estrutura exibe essa invariante?",
            ALT_ESTRUTURA["bst"],
            "Árvore binária de busca",
        ),
    ],
    ("bst", "operacao"): [
        _p(
            "operacao",
            "O procedimento demonstrado — descer pelo ramo esquerdo ou direito conforme a comparação com a chave do nó corrente — é denominado:",
            ALT_OPERACAO["bst"],
            "busca binária em árvore (pior caso degenerado)",
        ),
        _p(
            "operacao",
            "A rotina de inserção/busca descendente guiada pela ordem lateral das chaves, cujo custo depende da altura da estrutura, é identificada por:",
            ALT_OPERACAO["bst"],
            "busca binária em árvore (pior caso degenerado)",
        ),
    ],
    ("bst", "complexidade"): [
        _p(
            "complexidade",
            "Sem rebalanceamento, uma sequência monotônica de inserções pode degenerar a estrutura num caminho. Qual é a complexidade de pior caso de uma busca?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(n)",
        ),
        _p(
            "complexidade",
            "Admitindo que inserções em ordem crescente podem produzir uma estrutura degenerada equivalente a uma lista, qual é a complexidade de pior caso de uma busca?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(n)",
        ),
    ],

    ("linkedlist", "estrutura"): [
        _p(
            "estrutura",
            "A rotina mantém uma sequência de nós em que cada um referencia o próximo; "
            "para inserir ou remover numa posição arbitrária é necessário percorrer a cadeia a partir do começo. Qual estrutura essa descrição caracteriza?",
            ALT_ESTRUTURA["linkedlist"],
            "Lista duplamente encadeada",
        ),
        _p(
            "estrutura",
            "Os elementos são mantidos em nós distintos conectados por referências explícitas, sem armazenamento contíguo em arranjo. "
            "O acesso a uma posição arbitrária exige travessia sequencial. Qual estrutura obedece a essa organização?",
            ALT_ESTRUTURA["linkedlist"],
            "Lista duplamente encadeada",
        ),
    ],
    ("linkedlist", "operacao"): [
        _p(
            "operacao",
            "O par de operações demonstrado — travessia até uma posição k e inserção/remoção no nó correspondente — recebe tradicionalmente o nome:",
            ALT_OPERACAO["linkedlist"],
            "insert_at / remove_at (posição arbitrária)",
        ),
        _p(
            "operacao",
            "Qual é a designação canônica das rotinas que percorrem a cadeia até uma posição k para então inserir ou remover um nó?",
            ALT_OPERACAO["linkedlist"],
            "insert_at / remove_at (posição arbitrária)",
        ),
    ],
    ("linkedlist", "complexidade"): [
        _p(
            "complexidade",
            "Como a travessia até a posição k custa k ligações percorridas no pior caso, qual é a complexidade de pior caso de uma inserção ou remoção em posição arbitrária?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(n)",
        ),
        _p(
            "complexidade",
            "Dado que o acesso ao k-ésimo nó requer percorrer k referências, qual é o custo assintótico de pior caso de uma operação em posição arbitrária?",
            ALT_COMPLEXIDADE_DEFAULT,
            "O(n)",
        ),
    ],

    ("grafo", "estrutura"): [
        _p(
            "estrutura",
            "A rotina trabalha sobre um conjunto de vértices conectados por arestas ponderadas direcionadas; "
            "o procedimento visita vértices em ordem de custo acumulado crescente, relaxando arestas a partir de cada vértice extraído. Qual estrutura subjaz a esse procedimento?",
            ALT_ESTRUTURA["grafo"],
            "Grafo ponderado dirigido",
        ),
        _p(
            "estrutura",
            "A rotina opera sobre um par (V, E) com pesos atribuídos às arestas e explora os vértices mantendo um conjunto de distâncias provisórias atualizadas por relaxamento. "
            "Qual estrutura essa descrição caracteriza?",
            ALT_ESTRUTURA["grafo"],
            "Grafo ponderado dirigido",
        ),
    ],
    ("grafo", "operacao"): [
        _p(
            "operacao",
            "O algoritmo demonstrado — manter distâncias provisórias, extrair iterativamente o vértice de menor distância e relaxar suas arestas — é conhecido como:",
            ALT_OPERACAO["grafo"],
            "Dijkstra (via fila de prioridade)",
        ),
        _p(
            "operacao",
            "Qual algoritmo clássico de caminhos mínimos de fonte única em grafos com pesos não-negativos a rotina executa, apoiado em uma fila de prioridade?",
            ALT_OPERACAO["grafo"],
            "Dijkstra (via fila de prioridade)",
        ),
    ],
    ("grafo", "complexidade"): [
        _p(
            "complexidade",
            "Com fila de prioridade implementada como monte binário, o algoritmo demonstrado executa em qual classe de complexidade assintótica no pior caso?",
            ALT_COMPLEXIDADE_GRAFO,
            "O((V+E) log V)",
        ),
        _p(
            "complexidade",
            "Supondo extração de mínimo e decrease-key em tempo logarítmico sobre uma fila de prioridade binária, qual é a complexidade de pior caso deste algoritmo?",
            ALT_COMPLEXIDADE_GRAFO,
            "O((V+E) log V)",
        ),
    ],
}


def montar_pergunta(estrutura: str, operacao: str, camada: str, rng: Random) -> Pergunta:
    chave = (estrutura, camada)
    if chave not in BANCO:
        raise KeyError(f"combinação sem perguntas cadastradas: {chave}")
    original = rng.choice(BANCO[chave])
    correta = original.alternativas[original.indice_correto]
    alternativas = list(original.alternativas)
    rng.shuffle(alternativas)
    return Pergunta(
        camada=original.camada,
        enunciado=original.enunciado,
        alternativas=(alternativas[0], alternativas[1], alternativas[2], alternativas[3]),
        indice_correto=alternativas.index(correta),
    )
