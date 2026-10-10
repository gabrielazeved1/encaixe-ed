# Implementation Plan: Jogo "Adivinhe a Estrutura"

**Branch**: `004-jogo-adivinhe-estrutura` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-jogo-adivinhe-estrutura/spec.md`

## Summary

Jogo pedagógico em que o aluno vê os passos de uma operação sobre uma das 7 estruturas puras do Encaixe (Pilha, Fila, Heap, Hash, BST, LinkedList, Grafo), sem nenhum rótulo da estrutura, e precisa adivinhar qual é. A mecânica (destaques `topo`, `início/fim`, `bucket:N`, `aresta:A-B`, trocas pai/filho de sift, descida esquerda/direita) é a única pista. Após o palpite, o veredito revela a estrutura correta e explica o fingerprint.

Abordagem técnica: um novo módulo puro `backend/core/jogo/` concentra sorteio, geração de passos (reutilizando as 7 estruturas atuais sem alterá-las), token HMAC-SHA256 stateless (sem storage), varredura de neutralidade contra lista proibida de nomes, e explicações. Um novo app Django `apps/jogo_adivinhe/` expõe 2 endpoints magros (`GET /api/jogo_adivinhe/rodada`, `POST /api/jogo_adivinhe/palpite`). Frontend ganha rota `/adivinhe` que reutiliza `StepControls` + `StepNarrator` da feature 002 e um novo `PassosGenericoVisual` que renderiza APENAS texto + pills (sem SVG, sem diagrama estrutura-específico) para evitar vazamento visual.

## Technical Context

**Language/Version**: Python 3.14.7 (backend) · TypeScript 5+ (frontend)

**Primary Dependencies**: Django 5 · Django REST Framework (backend); Next.js 14+ App Router · Tailwind CSS (frontend). Nenhuma dependência nova.

**Storage**: nenhum — token HMAC stateless carrega as claims da rodada. `SECRET_KEY` do Django é a chave de assinatura.

**Testing**: pytest (backend, 100% da lógica em `core/jogo/` testável sem Django) · vitest (frontend)

**Target Platform**: Vercel (frontend) · Render (backend). Desktop-first; mobile apenas não-quebra.

**Project Type**: web (Next.js + Django)

**Performance Goals**: rodada carrega em < 300 ms local (SC-003/SC-004); palpite devolve veredito em < 100 ms local; expiração detectada em < 100 ms (SC-006).

**Constraints**: sem autenticação; sem persistência entre sessões; stateless (constituição); nenhuma menção às 7 substrings proibidas pode aparecer nos passos entregues ao cliente (FR-006).

**Scale/Scope**: um só servidor, qualquer número de jogadores concorrentes (sem estado compartilhado além da `SECRET_KEY`), 2 endpoints, 1 rota frontend, ~6 arquivos backend novos e ~5 arquivos frontend novos.

## Constitution Check

| Princípio | Status | Nota |
|---|---|---|
| I. Core-First (módulos Python puros) | ✅ | Toda lógica em `backend/core/jogo/*.py`, sem imports de Django. Estruturas de `core/estruturas/` não ganham métodos novos — jogo apenas as consome. |
| II. Views Magras | ✅ | `jogo_adivinhe/views.py` só valida com serializers → chama `core/jogo/sortear.py` ou `core/jogo/avaliar.py` → serializa. Nenhuma lógica de jogo nas views. |
| III. Tipagem estrita | ✅ | Type hints em todas as funções novas; frontend em `strict: true`. |
| IV. Teste antes do endpoint | ✅ | `test_sortear`, `test_avaliar`, `test_token`, `test_neutralidade` passam antes de `tests.py` do app Django. |
| V. Separação de responsabilidades no frontend | ✅ | `useAdivinheRodada` cuida de todo HTTP; componentes não fazem fetch; `lib/api.ts` ganha `getRodada()` e `postPalpite()`; nenhum texto educacional inline (as explicações vêm do backend em runtime). |
| VI. Stack travada | ✅ | Nenhuma dependência nova. `hmac`, `hashlib`, `base64`, `json` são stdlib. |

**Restrições de infraestrutura:**

- Sem autenticação: ✅ jogo é público.
- Sem persistência entre sessões: ✅ token stateless carrega a resposta correta assinada; servidor não guarda nada.
- Um endpoint por mini-projeto: ⚠️ **justificativa necessária** — o jogo expõe 2 endpoints (`/rodada` e `/palpite`). Documentado abaixo em "Complexity Tracking".
- Sem banco de dados relacional: ✅ nenhuma migration.

**Gate pré-pesquisa**: ✅ passa com uma justificativa documentada.

## Project Structure

### Documentation (this feature)

```text
specs/004-jogo-adivinhe-estrutura/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (2 endpoints)
└── tasks.md             # Gerado por /speckit-tasks
```

### Source Code (repository root)

```text
backend/
├── core/
│   ├── estruturas/          # inalterado — jogo apenas consome
│   └── jogo/                # NOVO — toda a lógica do jogo
│       ├── __init__.py
│       ├── sortear.py       # sortear(seed) → (estrutura_nome, passos, claims)
│       ├── avaliar.py       # avaliar(token, palpite) → Veredito
│       ├── token.py         # encode/decode HMAC
│       ├── explicacoes.py   # dict {estrutura: "mecânica típica..."}
│       ├── neutralidade.py  # varrer passos pela lista proibida
│       ├── operacoes.py     # mapa {estrutura: [operações jogáveis]}
│       └── tests/
│           ├── __init__.py
│           ├── test_sortear.py
│           ├── test_avaliar.py
│           ├── test_token.py
│           ├── test_neutralidade.py
│           └── test_explicacoes.py
├── apps/
│   └── jogo_adivinhe/       # NOVO — 2 views magras
│       ├── __init__.py
│       ├── apps.py
│       ├── urls.py
│       ├── views.py
│       ├── serializers.py
│       └── tests.py
└── config/urls.py           # adicionar include de jogo_adivinhe

frontend/
├── app/
│   ├── page.tsx             # home — adicionar card linkando /adivinhe (US4)
│   └── adivinhe/
│       ├── page.tsx         # entry server-component
│       └── AdivinheClient.tsx  # 'use client', estado da rodada
├── components/
│   ├── jogo/                # NOVO
│   │   ├── PassosGenericoVisual.tsx
│   │   ├── BotoesPalpite.tsx
│   │   └── Veredito.tsx
│   └── ui/                  # StepControls, StepNarrator — reusados sem mudanças
├── hooks/
│   └── useAdivinheRodada.ts # NOVO
└── lib/
    └── api.ts               # adicionar getRodada() e postPalpite()
```

**Structure Decision**: web app (backend + frontend), seguindo exatamente o padrão das features 001–003. O novo módulo `core/jogo/` é a única adição estrutural ao backend; frontend ganha uma rota isolada em `app/adivinhe/` que não interfere nas rotas de projetos existentes.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| 2 endpoints no app `jogo_adivinhe` (viola "Um endpoint por mini-projeto") | O ciclo do jogo é inerentemente de dois passos: (1) servidor emite rodada e token, (2) cliente devolve token + palpite para veredito. Fundir em um só endpoint exigiria POST para gerar rodada (quebrando o idioma GET-para-leitura) ou embutir o palpite no corpo da requisição que também sorteia (quebrando a reprodutibilidade por seed e a assinatura do token). O jogo é um 8º componente — distinto dos 7 mini-projetos — e a restrição constitucional aplica-se aos 7 projetos de estrutura. | Endpoint único (POST que ora sorteia ora julga) acopla duas responsabilidades e torna a URL ambígua para debugging via curl. Dois endpoints HTTP-idiomáticos são mais testáveis isoladamente e mais fáceis de documentar. |

Nenhuma outra violação. Nenhuma dependência nova. Nenhum método adicionado às estruturas puras.
