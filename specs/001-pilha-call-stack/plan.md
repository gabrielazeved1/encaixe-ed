# Implementation Plan: Visualizador de Pilha de Chamadas

**Branch**: `001-pilha-call-stack` | **Date**: 2026-09-12 | **Spec**: [spec.md](spec.md)

## Summary

Implementar o mini-projeto `pilha` — uma simulação interativa da pilha de chamadas
de funções recursivas (fatorial e Fibonacci). O backend executa a recursão instrumentada
em Python puro e retorna a sequência de eventos push/pop; o frontend anima esses eventos
quadro a quadro. O overflow de pilha é demonstrado para entradas grandes.

## Technical Context

| Campo | Valor |
| ----- | ----- |
| **Backend** | Python 3.14.7 · Django 5+ · DRF |
| **Frontend** | Next.js 14+ App Router · TypeScript strict · Tailwind CSS |
| **Storage** | N/A — stateless por design (Constituição, Restrições) |
| **Testing** | pytest (backend) · vitest (frontend) |
| **Platform** | Web — servidor Linux (Render) + browser |
| **Project Type** | Web application (frontend + backend separados) |
| **Performance** | Resposta < 2s para entradas normais (SC-001) |
| **Constraints** | MAX\_DEPTH = 50; sem persistência; sem autenticação |
| **Scale** | Usuário único por vez; sem concorrência significativa na v1 |

## Constitution Check

| Princípio | Status | Evidência |
| --------- | ------ | --------- |
| I. Core-First | ✅ | `Stack` implementada em `backend/core/estruturas/stack.py` sem imports Django |
| II. Views Magras | ✅ | `PilhaView`: valida com `PilhaSimularSerializer` → chama `simular_pilha()` → retorna JSON |
| III. Tipagem Estrita | ✅ | Type hints em todo `stack.py`; `strict: true` no frontend |
| IV. Teste Antes do Endpoint | ✅ | `test_stack.py` escrito e aprovado antes de `views.py` |
| V. Separação no Frontend | ✅ | `PilhaVisual.tsx` (UI), `usePilhaSimulacao.ts` (fetch), `lib/api.ts` (HTTP) |
| VI. Stack Travada | ✅ | Nenhuma dependência fora da lista aprovada |

Nenhuma violação. Prosseguindo.

## Project Structure

### Documentation (esta feature)

```text
specs/001-pilha-call-stack/
├── plan.md              ← este arquivo
├── research.md          ← decisões de Phase 0
├── data-model.md        ← entidades Frame, Evento, Simulação
├── contracts/
│   └── api.md           ← contrato POST /api/pilha/simular/
├── quickstart.md        ← guia de validação end-to-end
└── tasks.md             ← gerado pelo /speckit-tasks (próximo passo)
```

### Source Code

```text
backend/
├── core/
│   └── estruturas/
│       ├── stack.py          ← Stack pura: push, pop, peek, is_empty, __len__
│       └── tests/
│           └── test_stack.py ← testes unitários da Stack isolada
├── apps/
│   └── pilha/
│       ├── __init__.py
│       ├── apps.py
│       ├── views.py          ← PilhaView (POST /api/pilha/simular/)
│       ├── serializers.py    ← PilhaSimularSerializer (validação de entrada)
│       ├── urls.py           ← urlpatterns do app pilha
│       └── tests.py          ← testes de integração do endpoint
└── config/
    └── urls.py               ← inclui apps.pilha.urls em /api/pilha/

frontend/
├── app/
│   └── projetos/
│       └── [slug]/
│           └── page.tsx      ← template dinâmico (já existente)
├── components/
│   └── projetos/
│       └── PilhaVisual.tsx   ← recebe frames[], anima push/pop, sem fetch
├── hooks/
│   └── usePilhaSimulacao.ts  ← gerencia estado e chama lib/api.ts
├── lib/
│   └── api.ts                ← função pilhaSimular(funcao, valor)
└── content/
    └── projetos.ts           ← metadados + texto educacional do slug "pilha"
```

## Complexity Tracking

Sem violações da constituição — seção não aplicável.
