# Implementation Plan: Jogo Adivinhe — Modo Acadêmico Multi-camada

**Branch**: `005-adivinhe-academico` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-adivinhe-academico/spec.md`

## Summary

Upgrade do jogo "Adivinhe a Estrutura" (feature 004) para um fluxo acadêmico multi-camada: por rodada o aluno responde 3 perguntas (estrutura → operação → complexidade), em formato múltipla escolha estilo prova (4 alternativas A/B/C/D), navegando pelos passos com teclado, e vendo um veredito final com 3 cards de explicação acadêmica. Reutiliza o backend puro de `core/jogo/` com extensões: `operacoes.py` ganha metadata, novos módulos `perguntas.py` e `complexidade.py` adicionam o banco e o lookup de pior caso, e `avaliar.py`+`sortear.py` são adaptados para o fluxo em estágios. Breaking change assumido em `/palpite` (nova assinatura); frontend é reescrito como máquina de estados.

## Technical Context

**Language/Version**: Python 3.14.7 (backend) · TypeScript 5.x (frontend, strict mode)

**Primary Dependencies**: Django 5 + DRF (backend); Next.js 14 App Router + Tailwind CSS (frontend). Zero deps novas.

**Storage**: nenhuma — backend continua stateless, token HMAC carrega o gabarito.

**Testing**: pytest (backend); vitest + Testing Library (frontend).

**Target Platform**: web — desktop prioridade, mobile não pode quebrar.

**Project Type**: web application (backend Django + frontend Next.js, já estabelecido pelas features 001–004).

**Performance Goals**: rodada carrega em <300ms local; `/palpite` resposta em <100ms (lookup puro em dict + HMAC).

**Constraints**:
- Core-First (nenhum import de Django em `core/jogo/`).
- Views Magras (<20 LOC por view; só validar → chamar core → serializar).
- Zero regressão (256 testes backend + 26 testes frontend atuais devem continuar verdes).
- Neutralidade: nomes das 7 estruturas não aparecem em passos nem em enunciados de pergunta de estrutura.
- Stateless entre chamadas de palpite (sem armazenamento de pontuação parcial no servidor).

**Scale/Scope**:
- Banco de perguntas: ≥42 enunciados-base (7 estruturas × 3 camadas × 2 enunciados).
- 3 estágios por rodada × usuário.
- Expiração de token: 1h (herdada).

## Constitution Check

*Gate: deve passar antes do Phase 0; re-avaliar após Phase 1.*

| Princípio | Checagem | Status |
| --- | --- | --- |
| I — Core-First | Toda nova lógica fica em `backend/core/jogo/`. `core/estruturas/` não recebe alteração. | ✅ |
| II — Views Magras | 2 endpoints continuam fazendo só {validar via serializer → chamar core → serializar}. Toda regra (banco, derivação de complexidade, montagem de veredito) vive em core/jogo. | ✅ |
| III — Tipagem Estrita | Type hints em todas as funções novas de `core/jogo/`. TypeScript continua `strict`. | ✅ |
| IV — Teste Antes do Endpoint | Ordem para cada módulo: pytest da função pura → implementação → ajuste no endpoint → verificação de contrato. Reflete-se no tasks.md da feature. | ✅ |
| V — Separação Frontend | Fetch continua só no hook `useAdivinheRodada`. `lib/api.ts` é o único ponto de HTTP. Textos acadêmicos vivem no backend (vêm pela API); componentes de UI ficam agnósticos a conteúdo. | ✅ |
| VI — Stack Travada | Nenhuma dep nova. | ✅ |
| Restrições | Sem auth, sem persistência, 1 endpoint não — já são 2 endpoints desde a feature 004 (justificado lá: `/rodada` sortear + `/palpite` avaliar). Nenhum endpoint novo nesta feature. | ✅ |

**Resultado**: todas as portas abertas. Avançar para Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-adivinhe-academico/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 — decisões arquiteturais
├── data-model.md        # Phase 1 — entidades
├── quickstart.md        # Phase 1 — guia de validação
├── contracts/
│   ├── rodada.md        # GET /api/jogo_adivinhe/rodada (atualizado)
│   └── palpite.md       # POST /api/jogo_adivinhe/palpite (nova assinatura)
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec (já gerado)
└── tasks.md             # Phase 2 (gerado por /speckit-tasks)
```

### Source Code

```text
backend/
  core/jogo/
    __init__.py
    sortear.py        # ATUALIZADO: Rodada agora inclui pergunta_estrutura
    avaliar.py        # ATUALIZADO: aceita estagio; devolve veredito parcial + explicação
    token.py          # ATUALIZADO: claims {e, op, s, t}; valida op
    operacoes.py      # ESTENDIDO: OperacaoJogavel ganha nome_tecnico, invariante
    perguntas.py      # NOVO: BANCO + montar_pergunta()
    complexidade.py   # NOVO: PIOR_CASO[(estrutura, operacao)] -> str
    explicacoes.py    # ESTENDIDO: por (estrutura, camada)
    neutralidade.py   # ATUALIZADO: varredura_neutra aceita também lista de strings (enunciados)
    tests/
      test_sortear.py       # ATUALIZADO
      test_avaliar.py       # ATUALIZADO
      test_token.py         # ATUALIZADO
      test_neutralidade.py  # ATUALIZADO (+varre enunciados do banco)
      test_perguntas.py     # NOVO
      test_complexidade.py  # NOVO
      test_operacoes.py     # ESTENDIDO (metadata)
  apps/jogo_adivinhe/
    views.py          # ATUALIZADO
    serializers.py    # ATUALIZADO
    urls.py           # inalterado
    tests.py          # ESTENDIDO (fluxo 3 estágios)

frontend/
  app/adivinhe/
    page.tsx          # inalterado (repassa seedInicial)
    AdivinheClient.tsx # REESCRITO: máquina de estados
  components/jogo/
    PassosGenericoVisual.tsx   # inalterado
    PerguntaAcademica.tsx      # NOVO
    ProgressoRodada.tsx        # NOVO
    VereditoFinal.tsx          # NOVO
    Veredito.tsx               # DELETADO (substituído por VereditoFinal)
    BotoesPalpite.tsx          # DELETADO (não é mais usado)
  components/ui/
    StepControls.tsx           # inalterado
    StepNarrator.tsx           # inalterado
  hooks/
    useAdivinheRodada.ts       # REESCRITO
    useAtalhosRodada.ts        # NOVO
  lib/
    api.ts                     # ATUALIZADO: novos tipos; nova assinatura postPalpite
```

### Flow (resumo)

```
cliente abre /adivinhe
  → GET /rodada[?seed=N]
    → sortear(seed) devolve (token, passos, pergunta_estrutura)
cliente responde pergunta de estrutura
  → POST /palpite {token, estagio: "estrutura", palpite}
    → avaliar(token, "estrutura", palpite) devolve (acertou, correto, explicacao, proxima_pergunta_operacao)
cliente responde pergunta de operação
  → POST /palpite {token, estagio: "operacao", palpite}
    → avaliar(...) devolve (acertou, correto, explicacao, proxima_pergunta_complexidade)
cliente responde pergunta de complexidade
  → POST /palpite {token, estagio: "complexidade", palpite}
    → avaliar(...) devolve (acertou, correto, explicacao, FIM)
cliente monta tela de veredito final a partir dos 3 vereditos parciais acumulados localmente
```

## Phase 0 — Research

Consolidado em [research.md](./research.md). As decisões-chave:

- **D1** Breaking change em `/palpite` sem camada de compat — não há consumidores externos.
- **D2** Veredito final: **frontend** acumula os 3 vereditos parciais e monta a tela final. Backend permanece stateless; cada palpite devolve só sua explicação. Decisão sobre "pontuação" idem: calculada no frontend somando os `acertou` recebidos.
- **D3** Reordenação de alternativas: `random.Random(seed)` embaralha. O backend sempre compara `palpite` com o texto da alternativa correta (não com índice), então frontend pode exibir na ordem recebida sem precisar comunicar índice ao backend.
- **D4** Enunciados são enviados integralmente pelo backend (não apenas IDs). Simplifica o frontend e evita duplicação do banco textual.
- **D5** Explicações pós-veredito: um dict com `{acertou, errou}` por `(estrutura, camada)` — permite dar texto específico quando erra. V1 pode usar o mesmo texto nas duas variantes para abreviar; evolui depois.
- **D6** Validação de `op` no token: lookup contra `OPERACOES[estrutura]` (set de nomes técnicos). Tokens com `op` desconhecida ou inconsistente com `e` → `TokenInvalido`.
- **D7** `complexidade.py` como módulo próprio em vez de dentro de `operacoes.py` — mais fácil de testar isoladamente e separa responsabilidades.

## Phase 1 — Design & Contracts

### Data model

Em [data-model.md](./data-model.md). Entidades principais: `OperacaoJogavel` (estendida), `Pergunta`, `PerguntaRevelada` (sem gabarito, enviada ao frontend), `VereditoParcial`, `VereditoFinal`, `Explicacao`.

### API contracts

- [contracts/rodada.md](./contracts/rodada.md) — `GET /api/jogo_adivinhe/rodada[?seed=N]`
- [contracts/palpite.md](./contracts/palpite.md) — `POST /api/jogo_adivinhe/palpite`

### Quickstart

[quickstart.md](./quickstart.md) — 8 cenários de validação end-to-end.

## Constitution Check (post-design)

| Princípio | Checagem pós-design | Status |
| --- | --- | --- |
| I | Nada em `core/estruturas/`. `core/jogo/` ganha 2 módulos novos + extensões. | ✅ |
| II | Views continuam <20 LOC; toda lógica em core/jogo (sortear, avaliar). | ✅ |
| III | Dataclasses tipadas em `operacoes.py`, `perguntas.py`, `avaliar.py`. TS strict preservado. | ✅ |
| IV | Testes puros antes dos endpoints (ver tasks.md). | ✅ |
| V | Fetch continua só no hook. `lib/api.ts` central. | ✅ |
| VI | Zero deps novas. | ✅ |

Avançar para `/speckit-tasks`.

## Rollout / Riscos

- **Risco 1** — regressão silenciosa na feature 004: mitigado por `pytest -q` ao final de cada commit; qualquer teste da 004 que quebrar vira blocker.
- **Risco 2** — explosão de enunciados sem revisão humana: mitigado por testes que (a) varrem enunciados pela lista proibida, (b) checam que todo enunciado tem exatamente 4 alternativas e um `indice_correto` válido.
- **Risco 3** — token quebrado em sessões abertas do browser (quem já estava jogando a feature 004): aceitável — o próximo "Próxima" sortará nova rodada compatível com o novo formato.
- **Rollback**: `git revert` dos commits de frontend volta o jogo pra feature 004; backend fica com breaking change compatível com o novo frontend. Se precisar de rollback total, revert dos commits de backend também.

## Commits planejados

1. `docs(005): adiciona spec/plan/research/data-model/contratos/quickstart/tasks`
2. `feat(jogo): adiciona metadata em operacoes, banco de perguntas e lookup de complexidade (puro)`
3. `feat(jogo): atualiza token/sortear/avaliar para fluxo multi-camada`
4. `feat(jogo): atualiza endpoints /rodada e /palpite com testes de contrato`
5. `feat(jogo): adiciona componentes PerguntaAcademica, ProgressoRodada, VereditoFinal e hook de atalhos`
6. `feat(jogo): migra /adivinhe para fluxo multi-camada com teclado`
7. `chore(005): polish final (validação manual + atualização de docs se necessário)`
