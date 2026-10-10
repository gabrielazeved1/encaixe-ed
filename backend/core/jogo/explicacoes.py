from typing import Literal

from core.jogo.perguntas import CAMADAS, ESTRUTURAS

Variante = Literal["acertou", "errou"]


EXPLICACOES: dict[tuple[str, str], dict[Variante, str]] = {
    ("pilha", "estrutura"): {
        "acertou": (
            "A disciplina LIFO fica evidente pelo acesso restrito a uma única extremidade: toda inserção e toda remoção "
            "operam no topo, e o último inserido é o próximo a sair."
        ),
        "errou": (
            "A disciplina de acesso descrita — inserir e remover sempre pela mesma extremidade, mantendo invariante LIFO — "
            "exclui filas e árvores, que preservam ordem total ou lateral."
        ),
    },
    ("pilha", "operacao"): {
        "acertou": (
            "Push adiciona ao topo e pop remove do topo; essas são as primitivas canônicas de uma pilha, "
            "ambas em tempo constante numa implementação por arranjo contíguo."
        ),
        "errou": (
            "A nomenclatura clássica para o par (inserir no topo, remover do topo) é push + pop; "
            "enqueue/dequeue pertencem à fila, e SIFT-UP é reposicionamento em monte."
        ),
    },
    ("pilha", "complexidade"): {
        "acertou": (
            "Com topo explícito e capacidade suficiente, cada push ou pop requer apenas atualizar o topo e ler/escrever "
            "uma célula: O(1) no pior caso."
        ),
        "errou": (
            "A ausência de deslocamento interno ou busca garante custo constante por operação; O(n) ou O(log n) "
            "apareceriam em estruturas que exigem travessia ou reposicionamento."
        ),
    },
    ("fila", "estrutura"): {
        "acertou": (
            "A separação entre a extremidade de inserção e a de remoção caracteriza a invariante FIFO: "
            "o primeiro elemento inserido é o primeiro removido."
        ),
        "errou": (
            "A assimetria entre início e fim distingue a fila de pilhas (LIFO) e de montes (ordem parcial por prioridade)."
        ),
    },
    ("fila", "operacao"): {
        "acertou": (
            "Enqueue insere ao final e dequeue remove do início; é o par canônico de operações FIFO, "
            "ambas em tempo constante quando mantemos ponteiros explícitos de início e fim."
        ),
        "errou": (
            "O par enqueue + dequeue é a nomenclatura padrão para inserir no fim e remover do início; "
            "push/pop pertencem à pilha."
        ),
    },
    ("fila", "complexidade"): {
        "acertou": (
            "Com ponteiros explícitos para início e fim (ou arranjo circular), cada operação atualiza um ponteiro e "
            "uma célula em tempo constante: O(1) no pior caso."
        ),
        "errou": (
            "Como não há busca nem deslocamento de blocos quando os ponteiros são mantidos, o custo é constante; "
            "O(n) implicaria travessia e O(log n), estrutura logarítmica."
        ),
    },
    ("heap", "estrutura"): {
        "acertou": (
            "O arranjo visto como árvore implícita com restauração da propriedade pai-filho por reposicionamento ascendente "
            "é precisamente o monte binário usado em filas de prioridade."
        ),
        "errou": (
            "A invariante é de ordem parcial pai-filho (não ordem lateral entre irmãos), o que afasta árvores de busca; "
            "o reposicionamento ascendente é o fingerprint do monte binário."
        ),
    },
    ("heap", "operacao"): {
        "acertou": (
            "SIFT-UP (ou percolate-up) sobe o elemento recém-inserido trocando-o com o pai enquanto a propriedade "
            "de monte for violada, até restaurar a ordem parcial."
        ),
        "errou": (
            "SIFT-UP opera após inserção na última posição; SIFT-DOWN opera após remoção da raiz e HEAPIFY constrói "
            "o monte inteiro de uma vez."
        ),
    },
    ("heap", "complexidade"): {
        "acertou": (
            "A altura de um monte binário quase completo é ⌊log₂ n⌋; o reposicionamento ascendente percorre no pior "
            "caso o caminho folha→raiz, resultando em Θ(log n) por inserção."
        ),
        "errou": (
            "O custo é limitado pela altura da estrutura, não pelo tamanho total; O(n log n) seria o custo de construir "
            "o monte do zero, não de inserir um único elemento."
        ),
    },
    ("hash", "estrutura"): {
        "acertou": (
            "O mapeamento de chaves a índices por função de dispersão, com colisões resolvidas via encadeamento associado "
            "ao bucket, define a tabela de dispersão com encadeamento separado."
        ),
        "errou": (
            "O uso explícito de função de dispersão para localizar o bucket e de uma cadeia por bucket afasta árvores "
            "de busca e montes, que não têm esse mapeamento direto."
        ),
    },
    ("hash", "operacao"): {
        "acertou": (
            "O encadeamento separado trata colisões anexando os elementos conflitantes a uma lista por bucket, "
            "e a busca varre essa lista linearmente."
        ),
        "errou": (
            "A alternativa de endereçamento aberto resolve colisões procurando novas posições no próprio arranjo; "
            "o padrão descrito mantém encadeamentos externos."
        ),
    },
    ("hash", "complexidade"): {
        "acertou": (
            "No pior caso, uma função de dispersão degenerada envia todas as n chaves para o mesmo bucket, "
            "e a busca percorre toda a cadeia em O(n)."
        ),
        "errou": (
            "O custo médio pode ser O(1) com boa dispersão, mas o pior caso assintótico é O(n) quando todas as chaves "
            "colidem no mesmo bucket."
        ),
    },
    ("bst", "estrutura"): {
        "acertou": (
            "A invariante de ordem lateral — chaves menores à esquerda e maiores à direita — e a descida binária "
            "guiada pela comparação com o nó corrente caracterizam a árvore de busca."
        ),
        "errou": (
            "A invariante aqui é lateral (entre irmãos), não vertical (pai-filho); isso distingue árvores de busca de montes."
        ),
    },
    ("bst", "operacao"): {
        "acertou": (
            "A busca binária em árvore desce pelo ramo esquerdo ou direito conforme a comparação, com custo "
            "proporcional à altura — eficiente em árvores balanceadas, mas degenerada quando não há rebalanceamento."
        ),
        "errou": (
            "A rotina descrita percorre um único caminho da raiz a uma folha, não realiza reposicionamento (SIFT) "
            "nem opera sobre buckets de dispersão."
        ),
    },
    ("bst", "complexidade"): {
        "acertou": (
            "Sem rebalanceamento, uma sequência monotônica de inserções degenera a árvore em um caminho; a busca "
            "percorre todos os n nós no pior caso, custo O(n)."
        ),
        "errou": (
            "O(log n) é o custo médio em árvores balanceadas; o enunciado exige pior caso, que ocorre na forma degenerada."
        ),
    },
    ("linkedlist", "estrutura"): {
        "acertou": (
            "A conexão por referências explícitas entre nós, sem armazenamento contíguo, e a travessia sequencial "
            "necessária para alcançar uma posição k caracterizam a lista encadeada."
        ),
        "errou": (
            "A ausência de arranjo contíguo e de ponteiros bidirecionais explícitos de ordem parcial afasta montes "
            "e tabelas de dispersão; o acesso por travessia é a marca da lista."
        ),
    },
    ("linkedlist", "operacao"): {
        "acertou": (
            "insert_at e remove_at percorrem a cadeia até a posição alvo e reconfiguram as referências locais; "
            "o custo é dominado pela travessia."
        ),
        "errou": (
            "Push + pop operam em uma extremidade (típico de pilha); as operações descritas acessam posições arbitrárias, "
            "demandando travessia."
        ),
    },
    ("linkedlist", "complexidade"): {
        "acertou": (
            "O acesso ao k-ésimo nó requer percorrer k referências; no pior caso k = n-1, logo o custo da operação "
            "em posição arbitrária é O(n)."
        ),
        "errou": (
            "Sem acesso aleatório, não há como atingir a posição k em tempo constante; O(1) só se aplicaria às extremidades "
            "com ponteiros explícitos."
        ),
    },
    ("grafo", "estrutura"): {
        "acertou": (
            "Vértices conectados por arestas ponderadas, com um procedimento que relaxa arestas a partir do vértice "
            "de menor custo acumulado extraído de uma fila de prioridade, caracterizam Dijkstra sobre grafo ponderado."
        ),
        "errou": (
            "A manipulação de distâncias provisórias por relaxamento de arestas é incompatível com estruturas lineares; "
            "só grafos ponderados sustentam esse padrão."
        ),
    },
    ("grafo", "operacao"): {
        "acertou": (
            "Dijkstra mantém distâncias provisórias e, a cada iteração, extrai o vértice de menor distância e relaxa "
            "suas arestas de saída; é o algoritmo clássico de caminhos mínimos com pesos não-negativos."
        ),
        "errou": (
            "BFS visita por camadas em grafos não-ponderados; Prim constrói árvore geradora mínima. "
            "A combinação extração do mínimo + relaxamento é a assinatura de Dijkstra."
        ),
    },
    ("grafo", "complexidade"): {
        "acertou": (
            "Com fila de prioridade implementada como monte binário, cada extração e cada decrease-key custam O(log V); "
            "ao longo de todas as V extrações e E relaxamentos, chega-se a O((V+E) log V)."
        ),
        "errou": (
            "O custo depende da estrutura de prioridade escolhida; com monte binário, o fator log V é inevitável em "
            "ambas as operações, levando a O((V+E) log V) no pior caso."
        ),
    },
}


def obter_explicacao(estrutura: str, camada: str, acertou: bool) -> str:
    chave = (estrutura, camada)
    if chave not in EXPLICACOES:
        raise KeyError(f"sem explicação para {chave}")
    variante: Variante = "acertou" if acertou else "errou"
    return EXPLICACOES[chave][variante]


__all__ = ["EXPLICACOES", "obter_explicacao", "Variante", "ESTRUTURAS", "CAMADAS"]
