export type Disciplina = {
  nome: string;
  relacao: string;
};

export type CorProjeto =
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "cyan"
  | "indigo"
  | "teal";

export type Projeto = {
  slug: string;
  nome: string;
  descricao: string;
  ed: string;
  cor: CorProjeto;
  disciplinas: Disciplina[];
  textoEd: string;
  operacoes?: string[];
  complexidade?: string;
};

export const COR_CLASSES: Record<
  CorProjeto,
  { bg: string; text: string; border: string }
> = {
  blue: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  green: {
    bg: "bg-green-500/15",
    text: "text-green-400",
    border: "border-green-500/30",
  },
  orange: {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/30",
  },
  purple: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  cyan: {
    bg: "bg-cyan-500/15",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  indigo: {
    bg: "bg-indigo-500/15",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
  },
  teal: {
    bg: "bg-teal-500/15",
    text: "text-teal-400",
    border: "border-teal-500/30",
  },
};

export const projetos: Projeto[] = [
  {
    slug: "pilha",
    nome: "Visualizador de Pilha de Chamadas",
    descricao:
      "Veja a pilha de chamadas crescer e encolher em tempo real ao executar funções recursivas.",
    ed: "Pilha",
    cor: "blue",
    operacoes: [
      "push(x) — adiciona ao topo",
      "pop() — remove o topo",
      "peek() — consulta o topo sem remover",
    ],
    complexidade: "push, pop, peek: O(1)",
    disciplinas: [
      {
        nome: "Arquitetura de Computadores",
        relacao:
          "A pilha de chamadas (call stack) é gerenciada pelo processador. Cada chamada de função empilha um stack frame com os registradores salvos, endereço de retorno e variáveis locais.",
      },
      {
        nome: "Sistemas Operacionais",
        relacao:
          "O SO aloca uma região de memória chamada stack para cada thread do processo. O tamanho é limitado — estourar esse limite é o famoso stack overflow.",
      },
    ],
    textoEd: `Neste projeto implementamos uma pilha em Python puro e a usamos para simular a call stack real de funções recursivas — fatorial e fibonacci. A cada chamada, um novo frame é empilhado com o nome da função, o argumento e a profundidade. Quando a função retorna, o frame sai com o valor calculado.

A pilha tem limite de 50 frames. Se você pedir fibonacci(51), ela estoura — e você verá o evento "overflow" acontecer em tempo real.

No dia a dia: toda linguagem de programação tem uma call stack exatamente assim. O stack trace que aparece quando um programa lança uma exceção é essa pilha sendo impressa. Python, Java, JavaScript — todos usam esse mecanismo. Em Sistemas Operacionais você vai ver que o SO aloca uma região de memória chamada stack para cada thread, com tamanho limitado (tipicamente 1–8 MB).

A visualização aqui funciona em modo passo-a-passo: dispare uma simulação e navegue manualmente ou use o autoplay para ver cada push e pop com descrição em linguagem natural.`,
  },
  {
    slug: "escalonador",
    nome: "Escalonador de Processos",
    descricao:
      "Compare Round-Robin e escalonamento por prioridade rodando seus próprios processos.",
    ed: "Fila + Heap",
    cor: "green",
    disciplinas: [
      {
        nome: "Sistemas Operacionais",
        relacao:
          "O SO usa exatamente essas duas estruturas para decidir qual processo roda a seguir: fila FIFO para Round-Robin (todos iguais, na ordem de chegada) e heap de prioridade quando processos têm urgências diferentes.",
      },
    ],
    textoEd: `Neste projeto implementamos dois algoritmos de escalonamento em Python: Round-Robin usando uma Fila (Queue), e escalonamento por Prioridade usando um MinHeap.

No Round-Robin, todos os processos entram numa fila FIFO. Cada um recebe uma fatia de tempo (o quantum que você define). Se não terminou, volta para o fim da fila. Justo, mas sem noção de urgência.

No modo Prioridade, usamos um heap mínimo: a cada passo, o processo com menor número de prioridade (= mais urgente) é sempre escolhido primeiro, independente da ordem de chegada. O número 1 é a maior prioridade.

No dia a dia: o escalonador de CPU do Linux usa variações desses mesmos algoritmos — CFS (Completely Fair Scheduler) para processos normais e filas de prioridade real-time para processos críticos do sistema. Em Sistemas Operacionais você vai estudar exatamente esses dois modelos.`,
    operacoes: [
      "enqueue(x) — adiciona ao fim",
      "dequeue() — remove o primeiro",
      "push(p, x) — insere com prioridade",
      "pop() — remove o de menor prioridade",
    ],
    complexidade: "enqueue/dequeue: O(1) · push/pop (heap): O(log n)",
  },
  {
    slug: "roteamento",
    nome: "Roteamento com Dijkstra",
    descricao:
      "Monte uma rede de roteadores, defina custos de link e veja Dijkstra encontrar a rota mais barata.",
    ed: "Grafo Ponderado",
    cor: "purple",
    disciplinas: [
      {
        nome: "Redes de Computadores",
        relacao:
          "O protocolo OSPF (Open Shortest Path First) usa Dijkstra para calcular a tabela de roteamento de cada roteador — é literalmente o mesmo algoritmo rodando em equipamentos reais na internet.",
      },
      {
        nome: "Algoritmos e Estruturas de Dados",
        relacao:
          "Dijkstra é o algoritmo canônico de caminho mínimo em grafos ponderados com arestas de peso não-negativo, com complexidade O((V + E) log V) com heap.",
      },
    ],
    textoEd: `Neste projeto você monta uma rede de roteadores: define os nós (roteadores) e os links entre eles com seus custos (latência, distância, etc). O algoritmo de Dijkstra encontra a rota de menor custo total entre origem e destino.

A implementação usa um grafo de lista de adjacência e um MinHeap para sempre expandir o nó de menor custo acumulado. Você vê cada passo: qual nó foi visitado, com qual custo, e por qual caminho chegou lá.

No dia a dia: o protocolo OSPF, usado em roteadores reais da internet, roda Dijkstra para calcular a tabela de roteamento de cada equipamento. Quando um pacote sai do seu computador e passa por vários roteadores até chegar ao destino, cada roteador tomou sua decisão baseado nessa mesma lógica. Em Redes de Computadores você vai ver OSPF em detalhe.`,
    operacoes: [
      "add_no(n) — adiciona vértice",
      "add_aresta(u, v, c) — aresta com custo c",
      "dijkstra(origem, destino) — caminho mínimo",
    ],
    complexidade: "Dijkstra: O((V + E) log V)",
  },
  {
    slug: "graus-de-separacao",
    nome: "Graus de Separação",
    descricao:
      "Cadastre pessoas e amizades, escolha duas e veja BFS encontrar o caminho mais curto entre elas.",
    ed: "Grafo Não Ponderado",
    cor: "indigo",
    disciplinas: [
      {
        nome: "Teoria dos Grafos",
        relacao:
          "BFS encontra o caminho de menor número de arestas em grafos não ponderados — o conceito de 'graus de separação' é literalmente a distância em número de arestas entre dois vértices.",
      },
      {
        nome: "Redes de Computadores",
        relacao:
          "A descoberta de topologia em redes (como o protocolo STP usa BFS para construir a árvore geradora mínima) segue o mesmo princípio de exploração em camadas.",
      },
    ],
    textoEd: `Neste projeto a rede de amizades é um grafo não ponderado: cada pessoa é um nó, cada amizade é uma aresta sem peso. O BFS (Busca em Largura) explora camada por camada — primeiro os amigos diretos, depois os amigos dos amigos — garantindo encontrar o menor número de conexões entre duas pessoas.

A implementação usa uma fila (deque do Python) para controlar a ordem de visitação. Você vê os níveis sendo revelados: nível 0 é a origem, nível 1 são os amigos diretos, nível 2 os amigos de amigos, e assim por diante.

No dia a dia: LinkedIn mostra "2º grau" ou "3º grau" usando BFS sobre o grafo de conexões. O Facebook calculou em 2016 que a distância média entre quaisquer dois usuários era 3,57 graus. Em Teoria dos Grafos você vai provar formalmente por que BFS garante o caminho mínimo em grafos sem pesos.`,
    operacoes: [
      "add_no(n) — adiciona pessoa",
      "add_aresta(a, b) — adiciona amizade",
      "bfs(origem, destino) — caminho mais curto",
    ],
    complexidade: "BFS: O(V + E)",
  },
  {
    slug: "busca-hash",
    nome: "Busca Linear vs. Hash Table",
    descricao:
      "Pesquise em uma base de dados e compare quantas comparações a busca linear precisou vs. uma hash table.",
    ed: "Hash Table",
    cor: "orange",
    disciplinas: [
      {
        nome: "Banco de Dados",
        relacao:
          "Índices de banco de dados (hash indexes no PostgreSQL, por exemplo) usam tabelas hash para tornar buscas por chave exata O(1) — a diferença de desempenho contra uma varredura sequencial (full table scan) é drástica em tabelas grandes.",
      },
    ],
    textoEd: `Neste projeto a base tem 20 registros (registro_001 a registro_020). Você busca uma chave e vê lado a lado: quantas comparações a busca linear precisou (percorre do início até achar) versus quantas a hash table precisou (calcula o índice direto pela função hash).

A função hash usada é polynomial rolling hash — multiplica cada caractere pela sua posição e tira o módulo pelo tamanho da tabela. Colisões são resolvidas por encadeamento (chaining): o bucket vira uma lista. Daí por que às vezes o hash precisa de mais de 1 comparação.

No dia a dia: índices hash do PostgreSQL funcionam exatamente assim para buscas por igualdade exata (WHERE id = 42). Dicionários do Python e objetos do JavaScript são hash tables por baixo. Quando você acessa dados em O(1) em qualquer dessas linguagens, é esse mecanismo rodando.

A visualização aqui funciona em modo passo-a-passo: a tabela nasce vazia e cada inserção vai acendendo o bucket alvo — colisões ficam explícitas no narrador lateral. Você pode pausar entre dois passos para inspecionar como a chain cresceu antes da busca começar.`,
    operacoes: [
      "inserir(chave, valor) — insere no bucket hash(chave)",
      "buscar(chave) — acesso O(1) esperado",
      "hash(chave) → índice",
    ],
    complexidade: "inserir/buscar: O(1) esperado · O(n) pior caso",
  },
  {
    slug: "indice-bst",
    nome: "Índice com Árvore Binária",
    descricao:
      "Insira registros e veja a BST sendo construída. Busque um valor e compare com a varredura sequencial.",
    ed: "Árvore Binária de Busca",
    cor: "teal",
    disciplinas: [
      {
        nome: "Banco de Dados",
        relacao:
          "Índices B-Tree do PostgreSQL/MySQL são primas maiores da BST: mantêm os dados ordenados hierarquicamente para eliminar metade dos candidatos a cada comparação, em vez de varredura linha por linha.",
      },
      {
        nome: "Algoritmos e Estruturas de Dados",
        relacao:
          "A BST é a estrutura base para entender busca binária em estruturas dinâmicas — cada comparação reduz o espaço de busca pela metade, dando O(log n) esperado.",
      },
    ],
    textoEd: `Neste projeto você insere os valores na ordem que quiser — e a ordem importa. Os mesmos números inseridos em ordens diferentes geram árvores com formatos completamente diferentes (e desempenhos diferentes). Depois você busca um valor e vê cada decisão: "alvo menor → desce à esquerda", "alvo maior → desce à direita".

O resultado mostra lado a lado: quantas comparações a BST precisou vs. uma varredura linear. Para a árvore do exemplo (7 nós balanceados), a BST chega em qualquer valor em no máximo 3 comparações. Linear pode precisar de 7.

No dia a dia: índices B-Tree do PostgreSQL e MySQL são a evolução direta da BST — árvores com múltiplos filhos por nó para reduzir a altura e os acessos a disco. Quando você faz SELECT sem índice, o banco faz varredura linear. Com índice B-Tree, faz busca logarítmica. Em Banco de Dados você vai entender por que criar índices nos campos de busca frequente é uma das otimizações mais importantes.

A visualização aqui funciona em modo passo-a-passo: cada inserção e cada comparação da busca viram um passo com descrição em pt-BR. Dá para avançar manualmente ou deixar o autoplay rodar para ver a árvore nascendo nó a nó.`,
    operacoes: [
      "inserir(v) — posiciona mantendo BST property",
      "buscar(v) — O(log n) esperado",
      "para_dict() — serializa para JSON",
    ],
    complexidade:
      "busca/inserção: O(log n) esperado · O(n) pior caso (degenerada)",
  },
  {
    slug: "alocador-memoria",
    nome: "Alocador de Memória",
    descricao:
      "Aloque e libere blocos de memória e observe a lista encadeada de blocos livres e a fragmentação aumentando.",
    ed: "Lista Encadeada",
    cor: "cyan",
    disciplinas: [
      {
        nome: "Sistemas Operacionais",
        relacao:
          "malloc() e free() do C (e internamente o heap do seu processo) mantêm uma free list — lista encadeada de blocos livres. Fragmentação externa acontece quando os blocos livres ficam pequenos demais e espalhados para atender novas alocações.",
      },
    ],
    textoEd: `Neste projeto você tem 512 bytes de memória. Ao alocar, o alocador percorre a lista encadeada de blocos procurando o primeiro livre suficientemente grande (estratégia first-fit) e o divide em dois: um usado, um livre com o resto. Ao liberar, o bloco volta para a lista e o alocador funde blocos adjacentes livres (coalescing) para evitar que a memória fique picada.

A barra mostra o estado em tempo real: verde = livre, vermelho = usado. O índice de fragmentação sobe quando você aloca e libera blocos de tamanhos variados — mesmo com memória livre total, pode não existir um bloco contíguo grande o suficiente para uma nova alocação.

No dia a dia: malloc() e free() do C fazem exatamente isso. O heap do seu processo é gerenciado por um alocador (glibc usa uma variante chamada ptmalloc) com a mesma lista encadeada de blocos livres. Em Sistemas Operacionais você vai ver por que fragmentação é um problema real e as estratégias (best-fit, worst-fit, compactação) para mitigá-la.`,
    operacoes: [
      "alocar(tamanho) — first-fit na free list",
      "liberar(bloco_id) — devolve à free list",
      "coalescer() — une blocos adjacentes livres",
    ],
    complexidade: "alocar: O(n) · liberar: O(n) · coalescer: O(n)",
  },
];

export function getProjetoBySlug(slug: string): Projeto | undefined {
  return projetos.find((p) => p.slug === slug);
}
