# Implementation Plan: Modo Step-by-Step nas Visualizações

**Branch**: `002-step-by-step-visualizacoes` | **Date**: 2026-10-10 | **Spec**: [spec.md](spec.md)

## Summary

Transformar as visualizações atuais dos três mini-projetos de maior valor pedagógico (`pilha`, `indice_bst`, `busca_hash`) em experiências de depuração passo a passo: cada operação do backend passa a retornar, além do resultado, uma **sequência ordenada de passos** (`indice`, `descricao` em pt-BR, `destaques`, `estado`). O frontend ganha um player (`useStepPlayer`) que controla reprodução — play, pause, step forward/backward, slider de velocidade — e um painel narrativo que explica cada passo em linguagem natural, com destaque visual sincronizado.

A instrumentação vive **dentro das estruturas puras** (`core/estruturas/*.py`), sem acoplar a Django: cada função de simulação aceita (ou retorna) um coletor de passos. As views continuam magras — validam, chamam a estrutura, serializam. A compatibilidade é preservada: os quatro projetos ainda não migrados mantêm seus payloads atuais.

## Technical Context

| Campo              | Valor                                                                       |
| ------------------ | --------------------------------------------------------------------------- |
| **Backend**        | Python 3.14.7 · Django 5+ · DRF                                             |
| **Frontend**       | Next.js 14+ App Router · TypeScript strict · Tailwind CSS · Framer Motion\* |
| **Storage**        | N/A — stateless (Constituição, Restrições)                                  |
| **Testing**        | pytest (backend) · vitest + Testing Library (frontend)                      |
| **Platform**       | Web — Linux (Render) + browser moderno                                      |
| **Project Type**   | Web application (frontend + backend separados)                              |
| **Performance**    | Resposta < 2s para entradas normais; transição step < 16ms (SC-003)         |
| **Constraints**    | Sem persistência; sem auth; payload da operação ≤ 500 KB em entradas típicas |
| **Scale**          | Um usuário por vez; `pilha` com `MAX_DEPTH=50`; BST até ~50 inserções; hash até ~50 chaves |

\* Framer Motion já é dependência avaliada para animações; se ainda não estiver instalada, entra como parte desta feature (dentro da stack travada por ser biblioteca de UI compatível com Next.js, sem alterar princípio VI).

## Constitution Check

| Princípio                   | Status | Evidência                                                                                                           |
| --------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| I. Core-First               | ✅     | Instrumentação de passos adicionada em `core/estruturas/{stack,bst,hash_table}.py` sem imports de Django/DRF.       |
| II. Views Magras            | ✅     | `PilhaView`, `IndiceBstView`, `BuscaHashView` continuam: validar → chamar função pura → `Response(result)`.          |
| III. Tipagem Estrita        | ✅     | Novos tipos `Passo`, `SequenciaDeExecucao` com type hints; frontend em TS strict com tipos espelhados.               |
| IV. Teste Antes do Endpoint | ✅     | Testes unitários em `core/estruturas/tests/` cobrem a sequência de passos antes da serialização nas views.          |
| V. Separação no Frontend    | ✅     | `useStepPlayer` é hook de reprodução; hooks de fetch existentes (`usePilhaSimulacao` etc.) seguem fazendo HTTP via `lib/api.ts`. Componentes não fazem fetch. |
| VI. Stack Travada           | ✅     | Nenhuma dependência nova fora da lista aprovada. Framer Motion (se já em uso) permanece; nada é introduzido pelo backend.|

Nenhuma violação. Nenhuma justificativa a documentar em Complexity Tracking.

## Project Structure

### Documentation (esta feature)

```text
specs/002-step-by-step-visualizacoes/
├── plan.md               ← este arquivo
├── spec.md               ← já existente
├── research.md           ← Phase 0: decisões técnicas
├── data-model.md         ← Phase 1: entidades (Passo, SequênciaDeExecução, EstadoDeReprodução)
├── contracts/
│   ├── api-pilha.md      ← contrato POST /api/pilha/simular/ (passos)
│   ├── api-bst.md        ← contrato POST /api/bst/comparar/
│   └── api-hash.md       ← contrato POST /api/hash/comparar/
├── quickstart.md         ← validação end-to-end
├── checklists/
│   └── requirements.md   ← quality gate do spec
└── tasks.md              ← gerado pelo /speckit-tasks (próxima etapa)
```

### Source Code

```text
backend/
├── core/
│   └── estruturas/
│       ├── passos.py              ← NOVO: tipos Passo, PassoColetor + helper fazer_passo()
│       ├── stack.py               ← evolui: _simular_* geram passos no formato novo
│       ├── bst.py                 ← evolui: BST.inserir e BST.buscar recebem coletor opcional
│       ├── hash_table.py          ← evolui: HashTable.inserir e .buscar emitem passos de colisão
│       └── tests/
│           ├── test_stack.py      ← + testes de sequência de passos
│           ├── test_bst.py        ← NOVO/evoluído: passos de inserir + buscar
│           └── test_hash_table.py ← NOVO/evoluído: passos de colisão
├── apps/
│   ├── pilha/                     ← view inalterada; apenas resposta expandida com `passos`
│   ├── indice_bst/                ← idem
│   └── busca_hash/                ← idem
│   (os demais apps permanecem intocados)

frontend/
├── types/
│   └── passos.ts                  ← NOVO: `Passo<E>`, `SequenciaDeExecucao<E>` tipos genéricos
├── hooks/
│   ├── useStepPlayer.ts           ← NOVO: play/pause/step/velocidade sobre uma lista de passos
│   ├── usePilhaSimulacao.ts       ← ajuste: resposta inclui `passos`
│   ├── useIndiceBst.ts            ← idem
│   └── useBuscaHash.ts            ← idem
├── components/
│   ├── ui/
│   │   ├── StepControls.tsx       ← NOVO: botões play/pause/step/reset + slider de velocidade
│   │   └── StepNarrator.tsx       ← NOVO: barra lateral que exibe `descricao` + aponta destaques
│   └── projetos/
│       ├── PilhaVisual.tsx        ← recebe `passoAtual`, destaca frames do estado
│       ├── IndiceBstVisual.tsx    ← recebe `passoAtual`, destaca nós visitados
│       └── BuscaHashVisual.tsx    ← recebe `passoAtual`, destaca bucket + colisões
└── content/
    └── projetos.ts                ← inalterado (textos permanecem fora dos componentes)
```

**Structure Decision**: web application existente, com uma nova camada transversal (`passos.py` no backend, `types/passos.ts` + `useStepPlayer` + `StepControls`/`StepNarrator` no frontend) compartilhada entre os três mini-projetos integrados. Os quatro projetos não migrados ficam inalterados para preservar compatibilidade — a feature evolui apenas o payload dos três endpoints alvo, sem introduzir toggle de "modo clássico" no frontend (FR-012).

## Complexity Tracking

Sem violações da constituição — seção não aplicável.
