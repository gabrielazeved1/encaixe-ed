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

No dia a dia: abra o Chrome DevTools → aba Sources → pause em qualquer breakpoint. O painel "Call Stack" que aparece à direita é essa mesma pilha sendo exibida. O Ctrl+Z (desfazer) em editores como o VS Code mantém uma pilha de operações — cada edição empilha, cada Ctrl+Z desempilha. O botão "Voltar" do browser também é uma pilha de URLs visitadas. Stack overflow que você encontra no nome do site famoso vem exatamente daí — quando a pilha de chamadas transborda.

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

No dia a dia: abra o Activity Monitor (macOS) ou o Gerenciador de Tarefas (Windows) e olhe a coluna "% CPU" — o SO está rodando um escalonador por trás para decidir qual processo ocupa o processador em cada fatia de tempo. O driver de áudio do seu computador usa fila de prioridade real-time para nunca ter jitter no som (latência < 5ms). Jogos pedem para o Windows elevarem sua prioridade no heap para garantir framerate. Em servidores, filas de mensagem como RabbitMQ e Kafka implementam prioridade de consumo com a mesma estrutura de heap.`,
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

No dia a dia: quando você pede para o Google Maps ou Waze encontrar a rota mais rápida, por baixo está rodando uma variante de Dijkstra (ou A*) sobre um grafo de centenas de milhares de intersecções. O protocolo OSPF, usado em roteadores reais da internet, roda Dijkstra para calcular a tabela de roteamento de cada equipamento. Apps de delivery como iFood e Uber calculam o custo de cada entregador até você usando o mesmo princípio. Quando um pacote sai do seu computador e passa por 10 roteadores até chegar ao destino, cada salto foi decidido com base nessa lógica.`,
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

No dia a dia: o "2º grau" e "3º grau" que o LinkedIn mostra no seu perfil são calculados com BFS exatamente assim. "Pessoas que você talvez conheça" no Facebook e "Quem seguir" no Twitter vêm da mesma lógica — o sistema encontra quem está a 2 saltos de você no grafo de conexões. O Facebook calculou em 2016 que a distância média entre quaisquer dois de seus 1,5 bilhão de usuários era 3,57 graus — comprovando experimentalmente a "teoria dos seis graus". O jogo "The Oracle of Bacon" (o ator Kevin Bacon como hub do cinema) é a mesma ideia aplicada a coestrelações de filmes.`,
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
          "Índices hash do PostgreSQL tornam buscas por igualdade exata O(1) — mas só funcionam para '=', não para '>', '<' ou LIKE. Hash indexes são criados com CREATE INDEX USING HASH. Para buscas por intervalo, o banco usa B-Tree (árvore) em vez de hash.",
      },
      {
        nome: "Linguagens de Programação",
        relacao:
          "Dicionários Python, objetos JavaScript, HashMap em Java e std::unordered_map em C++ são todos hash tables. A complexidade O(1) amortizada de dict['chave'] é exatamente o que você vê aqui. Entender colisões explica por que hash tables degeneradas (todas chaves no mesmo bucket) viram O(n).",
      },
    ],
    textoEd: `Neste projeto a base tem 16 linguagens de programação. Você busca uma delas e vê lado a lado: quantas comparações a busca linear precisou (percorre na ordem de inserção do 1º ao 16º até achar) versus quantas a hash table precisou (calcula o índice direto pela função hash e vai direto ao bucket).

A função hash usada é polynomial rolling hash — combina cada caractere da chave e tira o módulo pelo tamanho da tabela (16 buckets). Colisões são resolvidas por encadeamento (chaining): quando dois valores caem no mesmo bucket, formam uma lista. Daí por que às vezes o hash precisa de mais de 1 comparação.

Atenção: a posição de uma linguagem na lista de inserção (1 a 16) é completamente diferente do número do bucket dela na tabela hash (0 a 15). "haskell" é o 14º da lista — por isso busca linear faz 14 comparações — mas a função hash a coloca no bucket [3], chegando em 1 ou 2 comparações.

No dia a dia: dicionários Python ({}) e objetos JavaScript ({}) são hash tables — cada chave acessa o valor em O(1). Redis, o banco de dados em memória mais usado do mundo, armazena todos os seus pares chave-valor numa hash table gigante. DNS resolve domínios para IPs usando cache baseado em hash. Índices hash do PostgreSQL funcionam assim para buscas por igualdade exata (WHERE email = '...').`,
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
          "Índices B-Tree do PostgreSQL/MySQL são a evolução direta da BST: funcionam para '=', '>', '<', BETWEEN e ORDER BY. Sem índice = Seq Scan (linear). Com índice = Index Scan (logarítmico). EXPLAIN ANALYZE numa query lenta vai mostrar exatamente essa diferença.",
      },
      {
        nome: "Algoritmos e Estruturas de Dados",
        relacao:
          "A BST explica por que inserir valores em ordem aleatória é melhor que em ordem crescente para performance. Árvores AVL e Red-Black (que você vai ver na disciplina) resolvem a degeneração com rotações automáticas — mas a BST simples aqui deixa a mecânica visível sem ruído.",
      },
    ],
    textoEd: `Neste projeto você insere os valores na ordem que quiser — e a ordem importa. Os mesmos números inseridos em ordens diferentes geram árvores com formatos completamente diferentes (e desempenhos diferentes). Depois você busca um valor e vê cada decisão: "alvo menor → desce à esquerda", "alvo maior → desce à direita".

O resultado mostra lado a lado: quantas comparações a BST precisou vs. uma varredura linear na ordem de inserção. Para a árvore do exemplo (7 nós balanceados), a BST chega em qualquer valor em no máximo 3 comparações. Linear pode precisar de 7.

Pior caso: esta BST não rebalanceia. Se os valores forem inseridos em ordem crescente (1, 2, 3, 4...) ou decrescente, a árvore degenera em uma estrutura equivalente a uma lista encadeada — cada nó só tem filho de um lado — e a busca passa a custar O(n), igual à varredura linear. Tente inserir "1,2,3,4,5,6,7" e observe. Em cenários reais usamos árvores balanceadas (AVL, Red-Black, B-Tree) para evitar essa degeneração.

No dia a dia: quando você roda SELECT * FROM usuarios WHERE email = 'joao@...' sem índice, o banco faz varredura linear em toda a tabela — igual à busca linear aqui. Com um índice B-Tree criado nessa coluna (CREATE INDEX), a busca se torna logarítmica. Em tabelas com milhões de linhas, essa diferença é de segundos para milissegundos. O comando EXPLAIN ANALYZE do PostgreSQL mostra exatamente essa decisão: "Seq Scan" (linear) vs "Index Scan" (árvore). Criar índices nos campos de busca frequente é uma das otimizações mais impactantes que um desenvolvedor backend pode fazer.`,
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

No dia a dia: malloc() e free() do C são exatamente esse alocador. "Memory leak" é quando você chama malloc() mas esquece o free() — os blocos ficam marcados como usados para sempre e a memória do processo cresce sem parar até travar. Jogos antigos (e alguns novos) travam após algumas horas de uso por memory leaks acumulados. Python, Java e Go têm garbage collector que chama free() automaticamente, mas isso tem custo de CPU. Rust elimina o problema na compilação com o sistema de ownership — o compilador sabe exatamente quando liberar cada bloco sem precisar de GC. Na prática, 80% dos bugs de segurança históricos do C/C++ vêm de erros nesse mecanismo (use-after-free, buffer overflow).`,
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
