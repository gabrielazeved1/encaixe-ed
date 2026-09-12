# Especificação Técnica — Site de Estruturas de Dados em Ação

> Este documento é a especificação oficial do projeto, escrito para ser usado como contexto/instrução no Claude Code. Ele substitui os rascunhos anteriores (dashboard Streamlit, lista solta de mini-projetos) — a partir daqui, este é o plano único.

---

## 1. Visão geral

**Nome sugerido:** "Encaixe — Estruturas de Dados em Ação" *(placeholder; troque à vontade)*

**O que é:** um site onde cada página é uma estrutura de dados clássica rodando de verdade, resolvendo um problema prático do dia a dia ou da faculdade — não um slide, uma demonstração interativa de verdade, com o algoritmo executando ao vivo.

**Autor:** Gabriel Azevedo Santos Lopes, formando em Engenharia de Computação pela UFU.

**Origem do projeto:** a ideia surgiu da leitura do livro/manual "Entendendo Estrutura de Dados" e do momento de fim de graduação — quando as peças de anos de disciplinas separadas (Sistemas Operacionais, Redes, Banco de Dados, Arquitetura) começam a se encaixar como aplicações concretas das mesmas poucas estruturas de dados estudadas no início do curso.

**Fluxo do usuário:**
1. Chega na home, entende o que é o site e por que ele existe.
2. Vai para a lista de projetos (grid de cards, um por estrutura/TAD).
3. Escolhe um projeto → vê a demonstração interativa, uma explicação da estrutura de dados usada, e quais disciplinas da faculdade se relacionam com ela.

---

## 2. Stack tecnológica (decisão)

| Camada | Escolha | Observação |
|---|---|---|
| Frontend | **Next.js (App Router) + TypeScript** | recomendado em vez de React puro por já vir com roteamento, SSR e build de produção prontos — menos configuração manual. Se preferir React puro (Vite), a arquitetura da seção 4 muda pouco: só troca `app/[slug]/page.tsx` por rotas do React Router. |
| Estilo | Tailwind CSS | opcional, mas acelera bastante; troque se tiver preferência |
| Backend | **Django + Django REST Framework** | expõe uma API JSON; nenhuma lógica de estrutura de dados vive no frontend |
| Comunicação | REST (JSON) | um endpoint por mini-projeto |
| Testes | `pytest` (backend), `vitest`/`jest` (frontend) | ver seção 6 |

---

## 3. Arquitetura

```
Next.js (frontend)
   |
   |  fetch (lib/api.ts)
   v
Django REST Framework (backend)
   |
   |  chama funções puras, sem nada de Django
   v
core/estruturas/*.py  (Stack, Queue, Heap, HashTable, BST, LinkedList, Graph)
```

Princípio central: as implementações das estruturas de dados são **código Python puro**, sem nenhuma dependência de Django. As views do Django apenas validam entrada e chamam essas funções — isso torna as estruturas testáveis isoladamente e reaproveitáveis entre projetos (ex.: o mesmo `Heap` serve para o escalonador e para o Dijkstra do roteamento).

---

## 4. Estrutura de páginas (rotas)

| Rota | Conteúdo |
|---|---|
| `/` | Home: resumo do projeto, autor, origem, call-to-action para a lista de projetos |
| `/projetos` | Grid com os 7 mini-projetos (card = nome, ED usada, disciplinas relacionadas) |
| `/projetos/[slug]` | Página de cada projeto — template comum com 3 seções (ver abaixo) |

**Template da página de projeto (`/projetos/[slug]`):**
1. **Demonstração interativa** — a aplicação em si (formulário + resultado ao vivo)
2. **Sobre esta estrutura** — texto explicando o TAD/ED usada (conceito, operações, complexidade)
3. **Onde isso aparece na faculdade** — lista/tabela das disciplinas UFU relacionadas e por quê

---

## 5. Os 7 mini-projetos

Cada um vira uma entrada em `frontend/content/projetos.ts` (ou equivalente) e um app Django no backend.

### 5.1 `pilha` — Visualizador de pilha de chamadas

- **ED:** Pilha (Stack)
- **Disciplinas:** Arquitetura de Computadores, Sistemas Operacionais
- **Demo:** usuário escolhe uma função recursiva (fatorial, Fibonacci) e um valor de entrada; a tela anima `push` a cada chamada e `pop` a cada retorno, mostrando a pilha crescer e encolher. Com entrada grande o suficiente, mostra o estouro de pilha acontecendo.
- **Texto educacional (rascunho):** "Uma pilha é uma estrutura LIFO (Last In, First Out): o último elemento inserido é o primeiro a sair. É exatamente assim que a pilha de chamadas (call stack) do seu processador funciona — cada chamada de função empilha um novo quadro de execução, e o retorno desempilha o mais recente. Entender pilha é entender por que recursão funciona, e por que ela pode estourar."
- **Endpoint sugerido:** `POST /api/pilha/simular/` — entrada `{ funcao, valor }`, saída `{ frames: [...] }`

### 5.2 `escalonador` — Simulador de escalonador de processos

- **ED:** Fila (Round-Robin) e Heap (por prioridade)
- **Disciplina:** Sistemas Operacionais
- **Demo:** usuário cadastra processos (nome, tempo de execução, prioridade) e escolhe o algoritmo; a tela gera um gráfico de Gantt comparando as duas estratégias.
- **Texto educacional (rascunho):** "Um sistema operacional decide qual processo roda a seguir usando exatamente estas duas estruturas: uma fila simples (FIFO) no escalonamento Round-Robin, tratando todos os processos igualmente, na ordem de chegada; ou um heap (fila de prioridade) quando processos têm prioridades diferentes, sempre executando o mais urgente primeiro."
- **Endpoint sugerido:** `POST /api/escalonador/simular/` — entrada `{ processos, algoritmo, quantum? }`, saída `{ gantt: [...] }`

### 5.3 `roteamento` — Simulador de tabela de roteamento

- **ED:** Grafo ponderado + Dijkstra (usa Heap por baixo)
- **Disciplina:** Redes de Computadores / Redes de Comunicações I e II
- **Demo:** usuário monta uma rede de roteadores com custo por link; escolhe origem e destino; a tela roda Dijkstra e destaca a rota mais barata e o custo acumulado até cada nó.
- **Texto educacional (rascunho):** "Uma rede de roteadores é um grafo: cada roteador é um vértice, cada link é uma aresta com um custo. Dijkstra encontra a rota mais barata explorando sempre o caminho de menor custo acumulado conhecido — é literalmente o que o protocolo OSPF faz na internet real."
- **Endpoint sugerido:** `POST /api/roteamento/calcular/` — entrada `{ nos, arestas, origem, destino }`, saída `{ caminho, custo_total, passos }`

### 5.4 `graus-de-separacao` — Graus de separação

- **ED:** Grafo não ponderado + BFS
- **Domínio:** teoria de grafos / redes sociais (não amarrado a uma disciplina específica da grade)
- **Demo:** usuário cadastra pessoas e amizades (ou gera uma rede aleatória); escolhe duas pessoas; a tela roda BFS e mostra o caminho mais curto e quantos graus de separação existem entre elas.
- **Texto educacional (rascunho):** "BFS explora um grafo em camadas — primeiro os vizinhos diretos, depois os vizinhos dos vizinhos — garantindo o menor número de conexões até o alvo. É o mesmo princípio por trás do jogo 'Kevin Bacon' e do Número de Erdős no meio acadêmico. Um estudo do Facebook com a Universidade de Milão mediu isso em escala real: 4,74 graus em 2011, caindo para 3,57 em 2016, à medida que a rede cresceu."
- **Endpoint sugerido:** `POST /api/grafos/graus-separacao/` — entrada `{ pessoas, amizades, origem, destino }`, saída `{ caminho, graus }`

### 5.5 `busca-hash` — Comparador de busca (linear vs. hash table)

- **ED:** Hash Table
- **Disciplina:** Banco de Dados
- **Demo:** mesma base de dados fictícia; usuário busca uma chave; a tela mostra, lado a lado, quantas comparações uma busca linear precisou fazer vs. uma tabela hash.
- **Texto educacional (rascunho):** "Bancos de dados usam tabelas hash (e variações delas) para tornar buscas por chave quase instantâneas. Uma função hash converte a chave em um índice de array; ao custo de eventuais colisões, o ganho é acesso esperado O(1), contra O(n) de uma varredura linear sem índice."
- **Endpoint sugerido:** `POST /api/hash/comparar-busca/` — entrada `{ dados, chave }`, saída `{ linear: {comparacoes}, hash: {comparacoes} }`

### 5.6 `indice-bst` — Simulador de índice (BST)

- **ED:** Árvore Binária de Busca
- **Disciplina:** Banco de Dados
- **Demo:** usuário insere registros; a tela mostra a árvore sendo montada e, ao buscar um valor, destaca o caminho percorrido — comparando com quantas comparações uma varredura sem índice exigiria.
- **Texto educacional (rascunho):** "Índices de banco de dados (B-Tree, uma prima maior da BST) seguem o mesmo princípio: manter os dados organizados hierarquicamente para que uma busca elimine metade dos candidatos a cada comparação, em vez de examinar linha por linha."
- **Endpoint sugerido:** `POST /api/bst/consultar/` — entrada `{ valores, operacao, valor }`, saída `{ arvore, passos }`

### 5.7 `alocador-memoria` — Alocador de memória (lista de blocos livres)

- **ED:** Lista Encadeada
- **Disciplina:** Sistemas Operacionais
- **Demo:** usuário aloca e libera blocos de tamanhos variados; a tela mostra a lista encadeada de blocos livres mudando e a fragmentação de memória aumentando.
- **Texto educacional (rascunho):** "Gerenciadores de memória mantêm uma lista encadeada dos blocos livres (free list). Alocar e liberar memória é, no fundo, inserir e remover nós dessa lista — e é isso que causa fragmentação quando os blocos livres ficam espalhados e pequenos demais para atender novos pedidos."
- **Endpoint sugerido:** `POST /api/memoria/simular/` — entrada `{ operacoes: [{tipo, tamanho, bloco_id}] }`, saída `{ blocos_livres, fragmentacao }`

---

## 6. Boas práticas de código

### Backend (Django / Python)

- Type hints em toda função e classe pública.
- Estruturas de dados isoladas em `core/estruturas/` — módulos **sem nenhuma dependência de Django**, testáveis sozinhos.
- Views magras: só validam entrada (via `serializers.py`) e chamam `core/estruturas/`. Nenhuma lógica de estrutura de dados dentro de uma view.
- Um app Django por mini-projeto, mas todos importando das mesmas classes em `core/estruturas/` (ex.: `escalonador` e `roteamento` reaproveitam o mesmo `Heap`).
- Docstrings explicando decisão de projeto, no mesmo espírito do manual: não só o quê, mas por quê.
- Testes unitários (`pytest`) cobrindo cada estrutura isoladamente; testes de integração cobrindo cada endpoint.

### Frontend (Next.js / TypeScript)

- TypeScript em modo estrito (`strict: true`).
- Separar visualização pura de busca de dados: componente de UI (`<PilhaVisual frames={...} />`) não faz fetch; um hook (`usePilhaSimulacao()`) cuida disso.
- Camada de API isolada em `lib/api.ts` — nenhum componente chama `fetch` diretamente.
- Conteúdo educacional (textos de cada ED, disciplinas relacionadas) centralizado em `content/projetos.ts`, não espalhado pelos componentes.
- ESLint + Prettier configurados desde o commit inicial.

---

## 7. Estrutura de pastas sugerida

```
projeto-estruturas-de-dados/
├── backend/
│   ├── config/                    # settings, urls raiz, wsgi/asgi
│   ├── core/
│   │   └── estruturas/            # implementações puras (sem Django)
│   │       ├── stack.py
│   │       ├── queue.py
│   │       ├── heap.py
│   │       ├── hash_table.py
│   │       ├── bst.py
│   │       ├── linked_list.py
│   │       └── graph.py
│   ├── apps/
│   │   ├── pilha/
│   │   ├── escalonador/
│   │   ├── roteamento/
│   │   ├── graus_separacao/
│   │   ├── busca_hash/
│   │   ├── indice_bst/
│   │   └── alocador_memoria/
│   │       # cada app: views.py, serializers.py, urls.py, tests.py
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── page.tsx                # Home
    │   └── projetos/
    │       ├── page.tsx            # lista de projetos
    │       └── [slug]/
    │           └── page.tsx        # template de projeto
    ├── components/
    │   ├── ui/                     # componentes genéricos
    │   └── projetos/                # visualizações específicas (PilhaVisual, GrafoVisual, ...)
    ├── lib/
    │   └── api.ts                  # client HTTP
    └── content/
        └── projetos.ts             # metadados + textos educacionais (seção 5)
```

---

## 8. Conteúdo pronto — página inicial

Use como rascunho inicial, ajustando o tom à vontade:

> **Encaixe — Estruturas de Dados em Ação**
>
> Este site nasceu da leitura do livro "Entendendo Estrutura de Dados" e do fim de uma graduação em Engenharia de Computação — o momento em que as peças de anos de disciplinas separadas finalmente se encaixam. Cada projeto aqui é uma estrutura de dados clássica — pilha, fila, heap, grafo, árvore, tabela hash, lista encadeada — rodando de verdade, resolvendo um problema prático, e ligada à disciplina da faculdade onde ela reaparece disfarçada de outro nome.
>
> Desenvolvido por **Gabriel Azevedo Santos Lopes**, formando em Engenharia de Computação pela UFU.

---

## 9. Roadmap de implementação sugerido

1. Backend: implementar e testar (pytest) as 7 estruturas puras em `core/estruturas/`.
2. Backend: criar os 7 endpoints, um de cada vez, validando com curl/Postman antes de seguir para o próximo.
3. Frontend: montar Home + lista de projetos com dados mockados (sem backend ainda).
4. Frontend: conectar o projeto mais simples (`pilha`) end-to-end — primeiro caso real de integração.
5. Repetir a integração para os outros 6 projetos.
6. Revisar o texto educacional de cada página (seção 5 é só rascunho).
7. Deploy: frontend no Vercel, backend no Render (ver decisão de hospedagem já tomada anteriormente).

---

## 10. Fora do escopo inicial

Ver backlog em `CLAUDE.md`.
