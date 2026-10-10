# Implementation Plan: Correções didáticas pré-jogo

**Branch**: `003-correcoes-didaticas-pre-jogo` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-correcoes-didaticas-pre-jogo/spec.md`

## Summary

Corrigir 5 pontos identificados na auditoria das 7 estruturas puras antes de abrir a próxima feature (jogo "Adivinhe a estrutura"). Escopo:

1. Bug do `encontrado` em `comparar_busca` (hash) — **já corrigido no commit `994d602`**.
2. Reescrita manual do `MinHeap` (sem `heapq`) com `_sift_up` / `_sift_down` expostos.
3. Separação do alocador em `alocador.py` e extração de `LinkedList[T]` genérica em `linked_list.py`.
4. Texto didático em `content/projetos.ts` (projeto `indice-bst`) sobre caso degenerado.
5. Expansão dos passos de Dijkstra para incluir relaxamento de arestas (não só finalizações).

**Abordagem técnica:** cada fix em um PR/commit independente, ordenado por risco crescente (heap → BST texto → split alocador → Dijkstra). Todos os endpoints mantêm contrato público. A instrumentação de passos reutiliza o envelope `Passo` já definido na feature 002 (`core/estruturas/passos.py`).

## Technical Context

**Language/Version**: Python 3.14.7 (via pyenv), TypeScript 5.x (strict)

**Primary Dependencies**: Django 5 + DRF (backend, só nas views), Next.js 14+ (frontend). Nenhuma dependência nova introduzida nesta feature.

**Storage**: N/A — estruturas puras in-memory, sem persistência.

**Testing**: `pytest` (backend) com testes já existentes para heap, graph, hash, linked_list. `vitest` (frontend) — não afetado por esta feature exceto por verificação de que a página `indice-bst` renderiza o texto novo.

**Target Platform**: Linux (Render para backend) + Edge/Vercel (frontend). Esta feature é puramente backend + 1 string estática no frontend.

**Project Type**: web app com separação frontend/backend em monorepo.

**Performance Goals**: n/a — fixes não alteram perfil de performance. Dijkstra ganha passos extras mas o grafo máximo do demo (6 cidades) continua resolvendo em microssegundos.

**Constraints**:
- Core-First (Princípio I): `core/estruturas/*.py` NÃO pode importar nada de Django.
- Views magras (Princípio II): endpoints continuam só validando → chamando estrutura → serializando.
- Testes antes do endpoint (Princípio IV): cada fix de core tem teste pytest ANTES do commit.
- Compatibilidade de contrato (SC-006): zero mudança de contrato público em endpoints — frontend atual continua funcionando sem alteração contra o backend reescrito.

**Scale/Scope**: 5 fixes, ~250 LOC alteradas no total (estimativa), 4 commits. Nenhum fix cruza a fronteira frontend ↔ backend exceto o texto estático em `content/projetos.ts`.

## Constitution Check

Avaliação dos 6 princípios da `.specify/memory/constitution.md`:

| # | Princípio | Status | Justificativa |
|---|---|---|---|
| I | Core-First | ✅ pass | Heap, LinkedList, Alocador e Dijkstra continuam em `backend/core/estruturas/` sem imports de Django. |
| II | Views Magras | ✅ pass | Nenhuma lógica nova em views. O rename do módulo exige ajuste em `apps/alocador_memoria/views.py`, mas é apenas de import. |
| III | Tipagem Estrita | ✅ pass | Novo código em Python mantém type hints completos. `LinkedList[T]` genérica usa `TypeVar`. Nenhum `any` novo no frontend. |
| IV | Teste Antes do Endpoint | ✅ pass | Cada fix de core começa pelo teste pytest. Endpoints não mudam. |
| V | Separação Frontend | ✅ pass | A única alteração frontend é uma string em `content/projetos.ts` — exatamente onde o Princípio V exige que fique. |
| VI | Stack Travada | ✅ pass | Nenhuma dependência nova. |

**Gate**: PASS — nenhum desvio da constituição. Nada a registrar em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-correcoes-didaticas-pre-jogo/
├── spec.md                     # já criado
├── plan.md                     # este arquivo
├── research.md                 # Fase 0
├── data-model.md               # Fase 1
├── quickstart.md               # Fase 1
├── contracts/                  # Fase 1 — contratos dos endpoints afetados
│   ├── alocador-memoria.md
│   ├── escalonador.md
│   └── roteamento.md
├── checklists/
│   └── requirements.md         # já criado
└── tasks.md                    # Fase 2 (gerado por /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── core/
│   └── estruturas/
│       ├── passos.py                   # reutilizado (feature 002)
│       ├── heap.py                     # 🔧 REESCRITO: sift manual
│       ├── linked_list.py              # 🔧 RESTRITO: apenas LinkedList[T] genérica
│       ├── alocador.py                 # 🆕 NOVO: alocador first-fit sobre LinkedList[Bloco]
│       ├── graph.py                    # 🔧 EXPANDIDO: Dijkstra com passos de relaxamento
│       ├── hash_table.py               # ✅ já corrigido (US1)
│       ├── bst.py                      # inalterado
│       ├── stack.py                    # inalterado
│       ├── queue.py                    # inalterado
│       └── tests/
│           ├── test_heap.py            # 🔧 novos testes para _sift_up/_sift_down
│           ├── test_linked_list.py     # 🔧 reescrito para testar LinkedList[T]
│           ├── test_alocador.py        # 🆕 NOVO: testes do alocador (migrados do test_linked_list.py antigo)
│           ├── test_graph.py           # 🔧 novo teste de passos de Dijkstra
│           └── test_hash_table.py      # ✅ regressão já adicionada
└── apps/
    └── alocador_memoria/
        └── views.py                    # 🔧 ajuste de import (linked_list → alocador)

frontend/
└── content/
    └── projetos.ts                     # 🔧 texto didático novo em indice-bst (textoEd)
```

**Structure Decision**: Monorepo com `backend/` + `frontend/`. Os fixes vivem majoritariamente em `backend/core/estruturas/` (código puro) + um único ponto no `frontend/content/`. Nenhum componente React novo. Nenhum endpoint novo. Nenhuma migração de banco.

## Complexity Tracking

Sem violações da constituição — tabela não aplicável.

## Phase 0 — Research

Ver [research.md](./research.md). Resumo das decisões:

- **Heap manual:** array interno `list[tuple[int,int,T]]` com `(prioridade, contador, item)`. `_sift_up(idx)` sobe comparando com pai; `_sift_down(idx)` desce comparando com menor filho. Tie-break FIFO vem do contador.
- **LinkedList genérica:** API mínima necessária — `push`, `insert_at`, `remove_at`, `__iter__`, `__len__`. Sem `reverse`, `find`, `clear` (não necessários agora; adicionar quando o jogo precisar).
- **Alocador consome LinkedList:** `alocador.py` tem `Alocador` com atributo `_lista: LinkedList[Bloco]`. First-fit varre `_lista`; `liberar(bloco)` encontra o nó, marca livre e coalesce.
- **Dijkstra relaxamento:** cada iteração dos vizinhos emite 1 passo (sempre), com descrição "olhando aresta A→B; custo atual de B é X; via A dá Y → atualizo/mantenho". Passo de finalização continua sendo emitido quando um nó sai do heap (hoje). Snapshot de estado inclui dict `distancias: {no: int}`.
- **Compatibilidade:** `/api/alocador_memoria`, `/api/escalonador`, `/api/roteamento` continuam retornando o mesmo JSON. O campo `passos` do Dijkstra pode crescer, mas o frontend atual não lê esse campo, então é retrocompatível.

## Phase 1 — Design & Contracts

Ver:
- [data-model.md](./data-model.md) — entidades `Node[T]`, `LinkedList[T]`, `Bloco`, `Alocador`, `MinHeap`, `PassoRelaxamento`.
- [contracts/](./contracts/) — contratos dos endpoints afetados (todos retrocompatíveis).
- [quickstart.md](./quickstart.md) — passos para validar a feature inteira em ~10 minutos.

### Constitution re-check (post-design)

Reavaliado após design:

| # | Princípio | Status | Observação |
|---|---|---|---|
| I | Core-First | ✅ pass | `alocador.py` novo é código puro Python; nenhum import de Django. |
| II | Views Magras | ✅ pass | View do alocador só muda a linha de import (`from core.estruturas.alocador import Alocador`). |
| III | Tipagem Estrita | ✅ pass | `LinkedList[T]` genérica com `TypeVar`. `Bloco` como `dataclass` tipada. |
| IV | Teste Antes do Endpoint | ✅ pass | Todas as tarefas de core começam com teste pytest antes do código. |
| V | Separação Frontend | ✅ pass | Mudança frontend é apenas texto em `content/projetos.ts`. |
| VI | Stack Travada | ✅ pass | Nenhuma dependência nova. |

**Gate pós-design**: PASS.
