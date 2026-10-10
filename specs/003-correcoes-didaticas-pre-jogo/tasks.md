---

description: "Task list — Correções didáticas pré-jogo"
---

# Tasks: Correções didáticas pré-jogo

**Input**: Design documents em `/specs/003-correcoes-didaticas-pre-jogo/`

**Prerequisites**: spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md (todos existem).

**Testes**: SIM — a Constituição IV exige teste pytest antes de qualquer alteração em `core/estruturas/`. Testes de contrato são opcionais aqui porque os endpoints não mudam de contrato (SC-006) — basta rodar o conjunto já existente de `apps/*/tests.py` depois de cada fix.

**Organização**: tarefas agrupadas por user story. US1 (hash) já está pronta no commit `994d602` e aparece marcada como concluída para rastreabilidade.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralelizável (arquivos diferentes, sem dependências pendentes).
- **[Story]**: a qual user story a task pertence.
- Todos os paths são absolutos a partir da raiz do repositório.

## Path Conventions

- Backend puro: `backend/core/estruturas/`
- Backend endpoint: `backend/apps/<app>/`
- Testes backend: `backend/core/estruturas/tests/` e `backend/apps/<app>/tests.py`
- Frontend texto: `frontend/content/projetos.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Nenhum setup novo é necessário — a feature reusa `core/estruturas/passos.py` (`Passo`, `PassoColetor`, `fazer_passo`) já criado na feature 002.

- [x] T001 Verificar que `backend/core/estruturas/passos.py` existe e expõe `Passo`, `PassoColetor`, `fazer_passo` (feature 002 — já pronto).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Rodar a suíte completa de testes no estado atual para capturar o baseline antes de qualquer fix.

- [ ] T002 Rodar `pytest` em `backend/` e salvar saída em `/tmp/baseline-pytest.txt` para confirmar que 100% dos testes passam ANTES das correções.
- [ ] T003 Rodar `npm run test` em `frontend/` e confirmar que passa — baseline do frontend.

**Checkpoint**: baseline verde registrado — correções podem começar.

---

## Phase 3: User Story 1 — Hash `encontrado` correto (Priority: P1) ✅ CONCLUÍDA

**Goal**: `comparar_busca` deriva `hash.encontrado` do próprio retorno da busca hash, não da linear.

**Independent Test**: `pytest core/estruturas/tests/test_hash_table.py::test_hash_encontrado_vem_do_resultado_da_busca_hash` passa.

### Implementation for User Story 1 (já aplicado no commit `994d602`)

- [x] T004 [US1] Alterar `backend/core/estruturas/hash_table.py` para capturar o valor retornado por `ht.buscar` e usar `valor is not None` em `hash.encontrado` (commit `994d602`).
- [x] T005 [US1] Adicionar `test_hash_encontrado_vem_do_resultado_da_busca_hash` em `backend/core/estruturas/tests/test_hash_table.py` (commit `994d602`).

**Checkpoint US1**: concluído.

---

## Phase 4: User Story 2 — Heap com sift manual visível (Priority: P1) 🎯 PRÓXIMA

**Goal**: `MinHeap` em `backend/core/estruturas/heap.py` passa a implementar sift manual, com `_sift_up` e `_sift_down` como métodos privados; sem imports de `heapq`.

**Independent Test**: `pytest core/estruturas/tests/test_heap.py` passa (incluindo testes novos de sift), e `pytest backend/apps/escalonador backend/apps/roteamento` continuam verdes (consumidores do heap).

### Tests for User Story 2

- [ ] T006 [US2] Adicionar em `backend/core/estruturas/tests/test_heap.py` teste `test_heap_nao_importa_heapq` que faz `import ast; mod = ast.parse(open("backend/core/estruturas/heap.py").read())` e verifica que nenhum `Import`/`ImportFrom` menciona `heapq`.
- [ ] T007 [US2] Adicionar em `backend/core/estruturas/tests/test_heap.py` teste `test_sift_up_e_sift_down_existem` que importa `MinHeap` e verifica `hasattr(MinHeap, "_sift_up")` e `hasattr(MinHeap, "_sift_down")`.
- [ ] T008 [US2] Adicionar em `backend/core/estruturas/tests/test_heap.py` teste `test_sift_down_apos_pop_mantem_invariante` que insere 20 valores aleatórios com seed fixo, chama `pop()` até esvaziar e verifica ordem crescente.

### Implementation for User Story 2

- [ ] T009 [US2] Reescrever `backend/core/estruturas/heap.py` removendo `import heapq`. Implementar `_sift_up(idx)` subindo enquanto `_data[idx] < _data[(idx-1)//2]` com swap; `_sift_down(idx)` descendo trocando com o menor filho enquanto houver violação. `push` anexa no final e chama `_sift_up(len(self._data)-1)`. `pop` troca topo com último, remove último, chama `_sift_down(0)`. Preservar `_counter` como tie-breaker FIFO (depende de T006–T008).
- [ ] T010 [US2] Rodar `pytest backend/core/estruturas/tests/test_heap.py backend/apps/escalonador backend/apps/roteamento -v` e confirmar 100% verde (depende de T009).

**Checkpoint US2**: heap manual pronto, consumidores verdes. **Commit**: `refactor(heap): reimplementa MinHeap com sift manual (sem heapq)`.

---

## Phase 5: User Story 4 — BST texto didático (Priority: P3)

**Goal**: Texto educacional do projeto `indice-bst` em `frontend/content/projetos.ts` menciona o caso degenerado (inserção em ordem → árvore vira lista encadeada, O(n) no pior caso).

**Independent Test**: `grep -i "degenera" frontend/content/projetos.ts` retorna no mínimo uma linha dentro do bloco do projeto `indice-bst`.

**Nota de ordem**: adiantada para ANTES do split `linked_list/alocador` porque é zero-risco técnico (string estática), rápida e desloca o escopo frontend desta feature para fora da zona de risco.

### Implementation for User Story 4

- [ ] T011 [US4] Localizar o bloco do projeto `indice-bst` em `frontend/content/projetos.ts` e acrescentar ao campo `textoEd` o parágrafo: "**Pior caso:** a BST não rebalanceia. Se os valores forem inseridos em ordem crescente ou decrescente, a árvore degenera em uma estrutura equivalente a uma lista encadeada e a busca passa a custar O(n). Em cenários reais usamos árvores balanceadas (AVL, Red-Black); aqui focamos na BST pura para ver a mecânica."
- [ ] T012 [US4] Rodar `npm run build` em `frontend/` e confirmar que o build compila sem erro (depende de T011).

**Checkpoint US4**: texto no ar. **Commit**: `docs(indice-bst): documenta caso degenerado no texto educacional`.

---

## Phase 6: User Story 3 — LinkedList genérica + Alocador separado (Priority: P2)

**Goal**: `linked_list.py` contém APENAS `Node[T]` + `LinkedList[T]` genérica. `alocador.py` novo contém `Bloco` + `Alocador` que consome `LinkedList[Bloco]`. Endpoint `/api/alocador_memoria` continua retrocompatível.

**Independent Test**: `pytest core/estruturas/tests/test_linked_list.py core/estruturas/tests/test_alocador.py backend/apps/alocador_memoria -v` passa.

### Tests for User Story 3 (nesta ordem)

- [ ] T013 [P] [US3] Criar `backend/core/estruturas/tests/test_linked_list.py` NOVO com testes para `LinkedList[T]` genérica: `push` anexa na cauda; `insert_at(0, x)` em lista vazia produz `[x]`; `insert_at(1, 99)` em `[1,2,3]` produz `[1,99,2,3]`; `remove_at(1)` em `[1,2,3]` retorna `2` e deixa `[1,3]`; `insert_at` com `pos < 0` ou `pos > len` levanta `IndexError`; `remove_at` em vazia levanta `IndexError`; `__iter__` percorre em ordem; `__len__` reflete tamanho.
- [ ] T014 [P] [US3] Criar `backend/core/estruturas/tests/test_alocador.py` NOVO migrando os testes atuais do alocador que vivem em `test_linked_list.py` (first-fit, coalescing adjacente, exaustão de memória). Importar de `core.estruturas.alocador`.

### Implementation for User Story 3

- [ ] T015 [US3] Criar `backend/core/estruturas/alocador.py` NOVO: `@dataclass` `Bloco(inicio: int, tamanho: int, livre: bool)` + classe `Alocador` com `_lista: LinkedList[Bloco]`, `__init__(capacidade: int)` iniciando com um único bloco livre `Bloco(0, capacidade, True)`, `alocar(tamanho)` first-fit (percorre `_lista`, acha primeiro livre com `b.tamanho >= tamanho`, divide se sobrar), `liberar(bloco)` que marca livre e coalesce vizinhos livres, `estado()` retornando `[{inicio, tamanho, livre}, ...]`. Importa `LinkedList` de `core.estruturas.linked_list` (depende de T013, T014).
- [ ] T016 [US3] Reescrever `backend/core/estruturas/linked_list.py` para conter APENAS `Node[T]` e `LinkedList[T]` com API mínima (`push`, `insert_at`, `remove_at`, `__iter__`, `__len__`). Remover TODA lógica de alocação daqui — ela vive em `alocador.py` agora (depende de T015).
- [ ] T017 [US3] Em `backend/apps/alocador_memoria/views.py`, trocar `from core.estruturas.linked_list import Alocador` (ou nome equivalente que existia) por `from core.estruturas.alocador import Alocador` (depende de T016).
- [ ] T018 [US3] Rodar `pytest backend/core/estruturas/tests/test_linked_list.py backend/core/estruturas/tests/test_alocador.py backend/apps/alocador_memoria -v` e confirmar 100% verde (depende de T015–T017).
- [ ] T019 [US3] Teste manual do endpoint: `curl -X POST http://localhost:8000/api/alocador_memoria -H "Content-Type: application/json" -d '{"capacidade": 64, "operacoes": [{"tipo": "alocar", "tamanho": 16}]}'` deve retornar o mesmo JSON de antes do rename (depende de T018).

**Checkpoint US3**: split concluído, endpoint retrocompatível. **Commit**: `refactor(core): separa LinkedList genérica do alocador de memória`.

---

## Phase 7: User Story 5 — Dijkstra com relaxamento de arestas (Priority: P2)

**Goal**: `graph.py` emite um passo por aresta visitada no Dijkstra, com descrição explicando o relaxamento. Distâncias finais permanecem bit-a-bit idênticas.

**Independent Test**: `pytest core/estruturas/tests/test_graph.py backend/apps/roteamento -v` passa, com teste novo verificando que `len(passos)` cresceu em relação a um baseline e `distancias` iguais.

### Tests for User Story 5 (nesta ordem)

- [x] T020 [US5] Antes de qualquer alteração em `graph.py`, capturar baseline em `backend/core/estruturas/tests/test_graph.py` — adicionar `BASELINE_DIJKSTRA = {"passos": N, "distancias": {...}}` para um grafo de referência de 3 nós, 3 arestas (A→B peso 1, A→C peso 4, B→C peso 2). O valor de N é a quantidade atual (rodar `pytest` uma vez para descobrir e preencher).
- [x] T021 [US5] Adicionar `test_dijkstra_distancias_inalteradas` em `backend/core/estruturas/tests/test_graph.py` comparando `distancias` do grafo de referência com `BASELINE_DIJKSTRA["distancias"]`.
- [x] T022 [US5] Adicionar `test_dijkstra_emite_passos_de_relaxamento` que verifica: existe pelo menos um passo com `destaques` contendo um item que começa com `"aresta:"`; o campo `estado.distancias` é um `dict`.
- [x] T023 [US5] Adicionar `test_dijkstra_relaxamento_descreve_atualizacao` verificando que para o grafo de referência (onde A→B relaxa B de ∞ para 1), existe um passo cuja `descricao` contém "atualizo" (ou equivalente) e `destaques` incluem `aresta:A-B`.
- [x] T024 [US5] Adicionar `test_dijkstra_relaxamento_descreve_manutencao` para um grafo onde uma aresta A→B NÃO melhora o caminho (ex.: já visitado via caminho mais curto). Verificar que a `descricao` contém "mantenho" (ou equivalente).
- [x] T025 [US5] Adicionar `test_dijkstra_passos_cresceu` que afirma `len(resultado["passos"]) > BASELINE_DIJKSTRA["passos"]`.

### Implementation for User Story 5

- [x] T026 [US5] Expandir a função que roda Dijkstra em `backend/core/estruturas/graph.py` para emitir, dentro do loop interno (iteração sobre vizinhos do nó popado), um `fazer_passo(coletor, descricao, destaques, estado)` por aresta visitada. `descricao` deve conter origem, destino, peso, custo atual do destino e custo via o nó corrente, terminando com "→ atualizo" ou "→ mantenho". `destaques` deve incluir `no:<corrente>`, `no:<destino>`, `aresta:<corrente>-<destino>`. `estado.distancias` deve ser `{no: int ou None}` (None para distância infinita). `estado.visitados` lista nós já finalizados. Preservar passos de finalização existentes. Preservar função pública `simular_roteamento` com assinatura e retorno idênticos exceto pelo crescimento de `passos` (depende de T020–T025).
- [x] T027 [US5] Rodar `pytest backend/core/estruturas/tests/test_graph.py backend/apps/roteamento -v` e confirmar 100% verde (depende de T026).
- [ ] T028 [US5] Teste manual: `curl -X POST http://localhost:8000/api/roteamento -H "Content-Type: application/json" -d '{...payload fixo...}'` e verificar que `distancias` permanece idêntico a um baseline capturado antes. `passos` pode crescer (retrocompatível) (depende de T027).

**Checkpoint US5**: Dijkstra instrumentado. **Commit**: `feat(dijkstra): adiciona passos de relaxamento de aresta na simulação`.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: validação final da feature inteira.

- [ ] T029 Rodar `pytest -q` no backend inteiro e comparar com `/tmp/baseline-pytest.txt`: todos os testes antigos devem permanecer verdes e novos testes das US2–US5 devem estar presentes.
- [ ] T030 Rodar `npm run build` e `npm run test` no frontend e confirmar que ambos passam.
- [ ] T031 Executar `specs/003-correcoes-didaticas-pre-jogo/quickstart.md` passo a passo e marcar os 5 cenários como validados.
- [ ] T032 Atualizar `MEMORY.md` do projeto (`.claude/.../memory/`) se alguma decisão desta feature precisar ser lembrada em sessões futuras (ex.: "heap foi reescrito manual em 2026-10 — não trocar por heapq de novo").

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001) → já pronto.
- Foundational (T002–T003) → captura baseline antes das correções.
- US1 (T004–T005) → já concluída (commit `994d602`).
- US2 Heap (T006–T010) → independente das demais; pode começar imediatamente após Foundational.
- US4 BST texto (T011–T012) → independente das demais.
- US3 LinkedList/Alocador (T013–T019) → independente das demais.
- US5 Dijkstra (T020–T028) → independente das demais.
- Polish (T029–T032) → após todas as user stories.

### Within Each User Story

Ordem rígida: **testes falhando → implementação → verificação final**. Isso respeita a Constituição IV.

- US2: T006, T007, T008 (testes falhando) → T009 (implementação) → T010 (verificação).
- US3: T013, T014 (testes novos) → T015 → T016 → T017 → T018 → T019.
- US5: T020–T025 (testes com baseline + afirmações) → T026 (implementação) → T027 → T028.

### Parallel Opportunities

**Entre user stories** (uma vez concluída a Phase 2 Foundational):
- Um dev pode fazer US2 enquanto outro faz US4 enquanto outro faz US3 — zero overlap de arquivos.

**Dentro de uma user story**:
- US3: T013 e T014 (dois arquivos de teste diferentes) são `[P]`.
- US2: T006, T007, T008 adicionam testes no MESMO arquivo (`test_heap.py`) — não paralelizáveis entre si, mas o arquivo inteiro é independente dos de outras US.

---

## Parallel Example: Dividir entre devs

```bash
# Após Phase 2 (baseline capturado):

# Dev A — US2 Heap
Task: "Adicionar testes de sift em backend/core/estruturas/tests/test_heap.py (T006-T008)"
Task: "Reescrever heap manual em backend/core/estruturas/heap.py (T009)"

# Dev B — US4 BST texto
Task: "Adicionar parágrafo sobre caso degenerado em frontend/content/projetos.ts (T011)"

# Dev C — US3 Split
Task: "Criar backend/core/estruturas/alocador.py e extrair LinkedList genérica (T013-T017)"

# Dev D — US5 Dijkstra
Task: "Expandir passos de Dijkstra com relaxamento em backend/core/estruturas/graph.py (T020-T026)"
```

---

## Implementation Strategy

### Ordem recomendada (menor risco primeiro, serial)

1. **Foundational** (T002–T003) — captura baseline.
2. **US2 Heap** (T006–T010) — reescrita interna, nenhum contrato muda. Commit único.
3. **US4 BST texto** (T011–T012) — string estática. Commit único.
4. **US3 Split** (T013–T019) — ajuste de imports é sensível. Commit único.
5. **US5 Dijkstra** (T020–T028) — passos extras, resultado idêntico. Commit único.
6. **Polish** (T029–T032) — validação final.

### MVP incremental

Cada user story (US2 em diante) é um commit publicável independente. O site continua funcionando entre commits. Possível parar após qualquer uma e ainda ter melhoria entregue.

---

## Notes

- US1 já foi mergeada (commit `994d602`). Suas tasks estão marcadas `[x]` para rastreabilidade.
- Nenhum endpoint muda contrato (SC-006). Testes de contrato explícitos foram omitidos — a verificação é via re-rodar `pytest backend/apps/<app>` depois de cada fix.
- Cada task é escopo de 1 arquivo (ou poucos arquivos relacionados) e produz um diff pequeno.
- Depois do commit de cada US, atualizar o checkbox desta `tasks.md` e rodar o `pytest` inteiro antes de abrir o próximo commit.
