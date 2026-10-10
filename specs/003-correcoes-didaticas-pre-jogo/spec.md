# Feature Specification: Correções didáticas pré-jogo

**Feature Branch**: `003-correcoes-didaticas-pre-jogo`

**Created**: 2026-10-10

**Status**: Draft

**Input**: Auditoria das 7 estruturas puras do core apontou 1 bug sutil (hash) e 4 incoerências didáticas (heap wrapper, linked_list com nome errado, BST sem documentar degeneração, Dijkstra sem relaxamento) que precisam ser corrigidas antes da próxima feature — o jogo "Adivinhe a estrutura" que vai depender de cada estrutura ser reconhecível pela sua mecânica.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Corrigir bug do "encontrado" na comparação hash (Priority: P1)

Estudante abre o projeto `busca_hash` e compara busca linear vs. hash. Hoje, o campo `encontrado` da seção hash é derivado do resultado da busca LINEAR, não da própria busca hash. Se um dia a função hash tivesse um bug (determinismo quebrado entre inserir/buscar), o site reportaria "hash encontrou" mentindo com base na linear.

**Why this priority**: É o único defeito funcional. O site hoje diz a coisa certa por acidente — vale corrigir antes que vire falso-positivo real.

**Independent Test**: Rodar `pytest` cobrindo `comparar_busca`. O teste de regressão existente já cobre: inserir chave `"a"`, buscar `"b"` → `hash.encontrado is False`; inserir `"a"`, buscar `"a"` → `hash.encontrado is True`.

**Acceptance Scenarios**:

1. **Dado** uma lista de dados onde a chave buscada existe, **Quando** chamo `comparar_busca`, **Então** `resultado["hash"]["encontrado"]` é `True` derivado do retorno da busca hash.
2. **Dado** uma lista de dados onde a chave buscada NÃO existe, **Quando** chamo `comparar_busca`, **Então** `resultado["hash"]["encontrado"]` é `False` derivado do retorno da busca hash (não copiado da linear).

---

### User Story 2 — Heap com sift manual visível (Priority: P1)

Estudante estuda heap pelo Encaixe. Hoje a implementação é um wrapper em cima da biblioteca padrão (`heapq`) — toda a mecânica de sift-up/sift-down fica escondida. Para um site que ENSINA ED, o aluno vê o resultado mas não a mecânica, que é justamente o que distingue heap de outras estruturas.

**Why this priority**: É pré-requisito do jogo "Adivinhe a estrutura" (feature 004). Se heap aparecer no jogo com passos opacos, ele deixa de ser reconhecível pelo que o define (ordenação parcial por sift em árvore em array).

**Independent Test**: Rodar `pytest` com os testes atuais de heap (push/pop ordenação, peek, tie-breaking FIFO, exceção em vazio). Nenhum deve quebrar. Novos testes garantem que `_sift_up` e `_sift_down` existem como métodos privados e são usados no fluxo de `push`/`pop`.

**Acceptance Scenarios**:

1. **Dado** um `MinHeap` novo, **Quando** faço `push(5,"a"), push(1,"b"), push(3,"c")`, **Então** `pop()` sucessivos retornam `(1,"b"), (3,"c"), (5,"a")`.
2. **Dado** inserções com mesma prioridade, **Quando** faço `pop` sucessivos, **Então** a ordem respeita FIFO entre empates (tie-break estável).
3. **Dado** `pop` em heap vazio, **Quando** chamo, **Então** `IndexError` é levantado.
4. **Dado** uma inspeção do módulo, **Quando** examino `heap.py`, **Então** existem métodos `_sift_up` e `_sift_down` com a lógica manual (sem delegar para `heapq`).

---

### User Story 3 — Separar `LinkedList` genérica do alocador (Priority: P2)

Hoje `linked_list.py` tem o nome de uma estrutura genérica, mas contém um alocador de memória que usa lista encadeada por baixo — sem API genérica (`inserir(pos, val)`, `remover(pos)`, iterador). O nome mente para quem lê o repositório.

**Why this priority**: Não é bloqueador do jogo, mas é dívida que vai piorar quando a feature 004 referenciar as 7 estruturas por nome. É mais fácil arrumar agora do que depois.

**Independent Test**: Rodar os testes atuais do alocador (first-fit, coalescing). Nada deve quebrar. Novos testes cobrem a `LinkedList<T>` extraída (push, insert_at, remove_at, iteração em ordem) e provam que o alocador consome essa classe.

**Acceptance Scenarios**:

1. **Dado** uma `LinkedList[T]` nova, **Quando** faço `push(1), push(2), push(3)` e itero, **Então** vejo `[1, 2, 3]` na ordem de inserção na cauda.
2. **Dado** uma `LinkedList[T]` com `[1, 2, 3]`, **Quando** faço `insert_at(1, 99)`, **Então** a lista passa a ser `[1, 99, 2, 3]`.
3. **Dado** o módulo `alocador`, **Quando** chamo `alocar(tamanho)` e `liberar(bloco)`, **Então** o comportamento first-fit com coalescing continua idêntico ao atual (testes existentes passam).
4. **Dado** o repositório, **Quando** faço grep por `linked_list.py`, **Então** não existe código de alocação dentro — contém APENAS a classe genérica; alocador vive em `alocador.py`.

---

### User Story 4 — Documentar caso degenerado da BST (Priority: P3)

Estudante lê o texto educacional do projeto `indice-bst` e não encontra nenhuma menção ao fato de que BST não rebalanceia — inserir valores em ordem produz uma árvore degenerada equivalente a uma lista encadeada (O(n) no pior caso).

**Why this priority**: É só texto didático, mas sem ele o aluno pode achar que BST é sempre O(log n) de verdade. Afeta a honestidade pedagógica.

**Independent Test**: Abrir `frontend/content/projetos.ts`, localizar o projeto `indice-bst`, confirmar que o campo `textoEd` contém pelo menos uma frase explicando a degeneração em caso de inserções ordenadas e o custo O(n).

**Acceptance Scenarios**:

1. **Dado** o conteúdo educacional do projeto `indice-bst`, **Quando** leio `textoEd`, **Então** encontro uma frase explicando o caso degenerado (inserção em ordem → BST vira lista encadeada, O(n) no pior caso).

---

### User Story 5 — Passos de Dijkstra com relaxamento de arestas (Priority: P2)

Hoje os passos de Dijkstra registram apenas nós "finalizados" (quando saem do heap). O aluno vê a sequência final de descobertas mas não a mecânica central do algoritmo: o relaxamento de aresta. Para ser didaticamente completo, cada aresta explorada precisa aparecer como um passo com descrição clara ("olhando aresta A→B; custo atual de B é X; via A dá Y → atualizo/mantenho").

**Why this priority**: O jogo (feature 004) pode mostrar passos de Dijkstra sem revelar o nome. Se os passos forem "nó X finalizado" sem contexto, não dá para distinguir de qualquer outro algoritmo de SSSP. Com relaxamento, o aluno reconhece Dijkstra pela mecânica.

**Independent Test**: Rodar `pytest` sobre `graph.py` com teste novo que verifica a sequência de passos para um grafo pequeno fixo. Nenhum teste existente de corretude de distâncias deve quebrar.

**Acceptance Scenarios**:

1. **Dado** um grafo pequeno com 3 nós e Dijkstra a partir de um nó origem, **Quando** inspeciono os passos retornados, **Então** vejo entradas descrevendo exploração de arestas (não apenas finalizações).
2. **Dado** uma aresta A→B com custo W, custo atual de B = `Dist_B` e custo via A = `Dist_A + W`, **Quando** `Dist_A + W < Dist_B`, **Então** existe um passo com descrição explicando a atualização.
3. **Dado** uma aresta A→B que NÃO melhora o caminho atual, **Quando** o algoritmo examina, **Então** existe um passo com descrição explicando que o custo via A é pior/igual e a distância é mantida.
4. **Dado** o grafo totalmente processado, **Quando** verifico as distâncias finais, **Então** continuam idênticas às calculadas pelo Dijkstra original (os passos adicionais não alteram o resultado).

---

### Edge Cases

- `comparar_busca` com dados vazios → `hash.encontrado` deve ser `False` sem exceção.
- `MinHeap.pop` em heap de 1 elemento → não quebra o invariante (não há sift-down a executar).
- `MinHeap` com empates em todas as prioridades → ordem de saída idêntica à ordem de entrada.
- `LinkedList.insert_at` com posição fora do intervalo → `IndexError`.
- `LinkedList.remove_at` em lista vazia → `IndexError`.
- Dijkstra em grafo com nós isolados (sem arestas de saída da origem) → nenhum passo de relaxamento após processar origem; nós não alcançáveis mantêm distância infinita.
- Dijkstra com aresta de peso zero → relaxamento acontece normalmente e é descrito.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `comparar_busca` DEVE derivar o campo `hash.encontrado` do retorno da própria busca hash, nunca do resultado da busca linear.
- **FR-002**: O módulo de heap DEVE implementar sift-up e sift-down manualmente, sem delegar para a biblioteca padrão de heap da linguagem.
- **FR-003**: O heap DEVE expor métodos privados `_sift_up(idx)` e `_sift_down(idx)` que operam sobre o array interno e são chamados pelas operações públicas de inserção e remoção.
- **FR-004**: A API pública do heap (`push`, `pop`, `peek`, `is_empty`, `__len__`) DEVE manter assinatura e comportamento idênticos aos atuais, incluindo tie-breaking FIFO e exceção em pop/peek de heap vazio.
- **FR-005**: O repositório DEVE conter uma classe `LinkedList[T]` genérica com, no mínimo: `push(item)` anexando na cauda, `insert_at(pos, item)`, `remove_at(pos)`, iteração em ordem e `__len__`.
- **FR-006**: O alocador de memória DEVE residir em um módulo próprio nomeado `alocador.py` e consumir internamente a `LinkedList[T]` para gerenciar a cadeia de blocos.
- **FR-007**: O comportamento público do alocador (first-fit, coalescing de blocos livres adjacentes) DEVE permanecer idêntico — todos os testes existentes devem continuar passando sem modificação.
- **FR-008**: O texto educacional do projeto `indice-bst` em `content/projetos.ts` DEVE conter ao menos uma frase explicando que a BST não rebalanceia e que inserções em ordem produzem uma árvore degenerada equivalente a lista encadeada com busca O(n) no pior caso.
- **FR-009**: A simulação de Dijkstra DEVE emitir um passo para CADA aresta explorada a partir do nó corrente, incluindo descrição em linguagem natural com o custo atual do destino, o custo via o nó corrente, e se a distância foi atualizada ou mantida.
- **FR-010**: A simulação de Dijkstra DEVE continuar emitindo os passos de finalização de nó existentes hoje — relaxamentos SOMAM aos passos atuais, não os substituem.
- **FR-011**: O resultado funcional de Dijkstra (distâncias e caminhos retornados) DEVE permanecer bit-a-bit idêntico ao atual — a instrumentação adicional não pode alterar a saída.
- **FR-012**: Cada passo novo (relaxamento) DEVE seguir o mesmo envelope já definido na feature 002 (`indice`, `descricao`, `destaques`, `estado`), com `destaques` apontando para o nó corrente e para a aresta visitada.

### Key Entities

- **Passo de relaxamento**: representa a inspeção de uma aresta no Dijkstra. Atributos: índice sequencial, descrição textual com nós origem/destino e custos, destaques (nó corrente, aresta A→B, nó destino), snapshot de estado (distâncias conhecidas no instante do passo).
- **LinkedList&lt;T&gt;**: estrutura de dados genérica — sequência encadeada de nós com `valor: T` e `proximo: Node[T] | None`. Operações: anexar na cauda, inserir em posição, remover em posição, iterar, consultar tamanho.
- **Alocador**: estrutura de alocação de memória sobre `LinkedList[Bloco]`. Blocos têm `inicio`, `tamanho`, `livre: bool`. Operações: `alocar(tamanho)` com first-fit, `liberar(bloco)` com coalescing de vizinhos livres.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos testes de backend (`pytest`) passam após as 5 correções.
- **SC-002**: Zero menções a `heapq` no código final de `heap.py` (confirmável por busca de texto no módulo).
- **SC-003**: `linked_list.py`, se existir, contém APENAS a classe genérica; a lógica de alocação vive em `alocador.py` (verificável por inspeção de arquivos e por grep: `alocar(` só aparece em `alocador.py` e nos testes do alocador).
- **SC-004**: O texto educacional de `indice-bst` menciona explicitamente as palavras-chave "degenerada" (ou "degeneração"), "ordem" e "O(n)" (ou equivalente de pior caso).
- **SC-005**: A quantidade de passos de Dijkstra para um grafo de referência de teste (3 nós, 3 arestas) é maior que a quantidade atual — comprovando que relaxamentos foram adicionados —, e as distâncias finais permanecem idênticas.
- **SC-006**: Nenhum endpoint do backend muda seu contrato público (verificável rodando o frontend atual sem modificação contra o backend reescrito).

## Assumptions

- A classe `LinkedList[T]` extraída não precisa ter todas as operações de uma linked list "de livro-texto" (ex.: reverse, find). Apenas o mínimo que o alocador precisa, mais o que torna a classe reutilizável para o jogo (feature 004).
- Nenhum front-end precisa ser alterado nesta feature, exceto o texto estático em `content/projetos.ts` (projeto `indice-bst`). As telas de heap/graph/alocador continuam consumindo os mesmos endpoints com os mesmos contratos.
- A instrumentação de passos no heap (sift-up/sift-down com descrições textuais tipo "subindo índice X com pai Y") NÃO entra nesta feature. Esta feature deixa a estrutura pronta para ser instrumentada depois pela feature 004 se o jogo precisar.
- O endpoint do alocador continua usando o mesmo caminho de import depois do rename — ajustar `apps/alocador_memoria/views.py` faz parte do escopo desta feature.
- A compatibilidade dos endpoints `/api/escalonador`, `/api/roteamento`, `/api/alocador_memoria` com o frontend atual é obrigatória. Breaking changes não são aceitáveis aqui — o site precisa continuar funcionando a cada commit.
