# Tasks: Visualizador de Pilha de Chamadas

**Input**: `specs/001-pilha-call-stack/` — spec.md, plan.md, data-model.md, contracts/api.md
**Branch**: `001-pilha-call-stack`

## Format: `[ID] [P?] [Story?] Descrição com caminho do arquivo`

- **[P]**: paralelizável (arquivos diferentes, sem dependência de task incompleta)
- **[Story]**: user story da spec (US1, US2, US3)
- Constituição Princípio IV: testes escritos **antes** do endpoint

---

## Phase 1: Setup — Estrutura do projeto

**Propósito**: Criar o esqueleto completo de backend e frontend antes de qualquer lógica.

- [ ] T001 Criar estrutura de diretórios do backend: `backend/config/`, `backend/core/estruturas/`, `backend/apps/pilha/`
- [ ] T002 [P] Criar `backend/manage.py` e `backend/config/__init__.py`, `backend/config/wsgi.py`, `backend/config/asgi.py`
- [ ] T003 Criar `backend/config/settings.py` com INSTALLED\_APPS, CORS, DRF e leitura de `.env`
- [ ] T004 Criar `backend/config/urls.py` com rota raiz `/api/` pronta para incluir apps
- [ ] T005 Criar `backend/requirements.txt` com django, djangorestframework, django-cors-headers, python-dotenv, pytest, pytest-django
- [ ] T006 [P] Criar `backend/.env.example` com SECRET\_KEY, DEBUG, ALLOWED\_HOSTS, CORS\_ALLOWED\_ORIGINS
- [ ] T007 [P] Criar `backend/core/__init__.py` e `backend/core/estruturas/__init__.py`
- [ ] T008 Criar estrutura do frontend Next.js: `frontend/package.json`, `frontend/tsconfig.json` (strict: true), `frontend/tailwind.config.ts`, `frontend/postcss.config.mjs`, `frontend/next.config.ts`
- [ ] T009 [P] Criar `frontend/app/layout.tsx` com metadados base e importação do globals.css
- [ ] T010 [P] Criar `frontend/app/globals.css` com diretivas Tailwind
- [ ] T011 [P] Criar esqueleto de `frontend/lib/api.ts` com tipagem base (sem lógica de negócio ainda)
- [ ] T012 [P] Criar `frontend/content/projetos.ts` com tipo `Projeto` e array vazio exportado

**Checkpoint**: `python manage.py check` no backend passa sem erros; `npm run build` no frontend compila.

---

## Phase 2: Foundational — Estrutura de dados pura (Princípio I + IV)

**Propósito**: Implementar e testar a `Stack` antes de qualquer código Django. Nenhuma
user story começa até esta fase estar completa e os testes passando.

⚠️ **CRÍTICO**: Princípio IV — testes devem existir e passar antes do endpoint.

- [ ] T013 Implementar classe `Stack` em `backend/core/estruturas/stack.py` com métodos `push(item)`, `pop()`, `peek()`, `is_empty() -> bool`, `__len__() -> int` e type hints completos
- [ ] T014 Criar `backend/core/estruturas/tests/__init__.py` e `backend/core/estruturas/tests/test_stack.py` com testes: `test_push_aumenta_tamanho`, `test_pop_retorna_e_remove_topo`, `test_peek_nao_remove`, `test_is_empty`, `test_pop_em_pilha_vazia_levanta_excecao`
- [ ] T015 Implementar função `simular_pilha(funcao: str, valor: int, max_depth: int = 50) -> dict` em `backend/core/estruturas/stack.py` — retorna `{funcao, valor, status, frames}` com eventos push/pop/overflow conforme `data-model.md`
- [ ] T016 Adicionar testes de `simular_pilha` em `backend/core/estruturas/tests/test_stack.py`: `test_fatorial_4_gera_8_eventos`, `test_fibonacci_5_tem_chamadas_duplicadas`, `test_overflow_emitido_apos_max_depth`, `test_valor_invalido_levanta_value_error`

**Checkpoint**: `pytest backend/core/estruturas/tests/ -v` — todos os testes PASSAM.

---

## Phase 3: User Story 1 — Visualizar execução recursiva (P1) 🎯 MVP

**Goal**: Usuário submete função + valor, recebe animação completa de push/pop da pilha.

**Independent Test**: Fatorial(4) retorna exatamente 8 eventos (4 push + 4 pop) em ordem
correta; animação exibe cada frame com nome, argumento e, nos pops, valor de retorno.

### Backend (US1)

- [ ] T017 [US1] Criar `backend/apps/pilha/__init__.py` e `backend/apps/pilha/apps.py` com `PilhaConfig`
- [ ] T018 [US1] Implementar `PilhaSimularSerializer` em `backend/apps/pilha/serializers.py` — valida `funcao` (enum: fatorial|fibonacci) e `valor` (inteiro ≥ 1) com mensagens de erro conforme `contracts/api.md`
- [ ] T019 [US1] Escrever testes de integração do endpoint em `backend/apps/pilha/tests.py`: `test_fatorial_retorna_200_com_frames`, `test_valor_invalido_retorna_400`, `test_funcao_invalida_retorna_400`
- [ ] T020 [US1] Implementar `PilhaView` em `backend/apps/pilha/views.py` — POST only, valida com `PilhaSimularSerializer`, chama `simular_pilha()`, retorna JSON (Princípio II: ≤ 20 linhas)
- [ ] T021 [US1] Criar `backend/apps/pilha/urls.py` com `path("simular/", PilhaView.as_view())`
- [ ] T022 [US1] Incluir `apps.pilha.urls` em `backend/config/urls.py` no prefixo `api/pilha/` e adicionar `pilha` a `INSTALLED_APPS` em `settings.py`

**Checkpoint**: `pytest backend/apps/pilha/tests.py -v` — todos os testes PASSAM.
`curl -X POST http://localhost:8000/api/pilha/simular/ -d '{"funcao":"fatorial","valor":4}'` retorna 200 com 8 frames.

### Frontend (US1)

- [ ] T023 [P] [US1] Adicionar função `pilhaSimular(funcao: string, valor: number): Promise<SimulacaoResult>` em `frontend/lib/api.ts` com tipos derivados do `data-model.md` (Frame, Evento, SimulacaoResult)
- [ ] T024 [P] [US1] Implementar `usePilhaSimulacao` em `frontend/hooks/usePilhaSimulacao.ts` — estado: `frames`, `status`, `loading`, `error`; expõe `simular(funcao, valor)`; chama apenas `lib/api.ts`
- [ ] T025 [US1] Implementar `PilhaVisual` em `frontend/components/projetos/PilhaVisual.tsx` — recebe `frames: Evento[]` e `status: string` como props; renderiza pilha animada frame a frame; **sem fetch**, sem lógica de negócio
- [ ] T026 [US1] Adicionar entrada `pilha` em `frontend/content/projetos.ts` com campos: `slug`, `nome`, `descricao`, `ed`, `disciplinas[]`
- [ ] T027 [US1] Integrar `usePilhaSimulacao` e `PilhaVisual` em `frontend/app/projetos/[slug]/page.tsx` para o slug `"pilha"` — formulário com select de função e input de valor

**Checkpoint**: `http://localhost:3000/projetos/pilha` — submeter fatorial(4), animação exibe 4 frames empilhando e 4 desempilhando com valores corretos.

---

## Phase 4: User Story 2 — Observar estouro de pilha (P2)

**Goal**: Valor grande causa overflow visível — pilha cheia, sinalização clara de stack overflow.

**Independent Test**: Fibonacci(100) exibe animação até 50 frames, último evento sinalizado
visualmente como overflow, mensagem explicativa visível.

- [ ] T028 [US2] Adicionar estado visual de overflow em `frontend/components/projetos/PilhaVisual.tsx` — quando `status === "overflow"`: destaque visual diferenciado no último frame, badge/mensagem "Stack Overflow" exibida
- [ ] T029 [US2] Adicionar teste de integração de overflow em `backend/apps/pilha/tests.py`: `test_fibonacci_grande_retorna_overflow_com_status_correto`
- [ ] T030 [P] [US2] Adicionar teste vitest em `frontend/components/projetos/PilhaVisual.test.tsx` verificando que prop `status="overflow"` renderiza o badge de stack overflow

**Checkpoint**: `http://localhost:3000/projetos/pilha` — fibonacci(100) exibe overflow com sinalização visual distinta.

---

## Phase 5: User Story 3 — Conteúdo educacional (P3)

**Goal**: Seções "Sobre esta estrutura" e "Onde aparece na faculdade" visíveis e completas.

**Independent Test**: Página `/projetos/pilha` contém seção com texto sobre LIFO e seção
com referências a Arquitetura de Computadores e Sistemas Operacionais.

- [ ] T031 [US3] Completar entrada `pilha` em `frontend/content/projetos.ts` com campos `textoEd` (explicação LIFO, recursão, stack overflow) e `disciplinas` com objetos `{nome, relacao}` para Arquitetura de Computadores e Sistemas Operacionais
- [ ] T032 [US3] Criar componente `SobreEstrutura` em `frontend/components/projetos/SobreEstrutura.tsx` — recebe `textoEd: string` e `disciplinas[]` como props; renderiza seções educativas; sem fetch
- [ ] T033 [US3] Integrar `SobreEstrutura` em `frontend/app/projetos/[slug]/page.tsx` abaixo da demonstração interativa

**Checkpoint**: Seções educativas visíveis em desktop (1440px) e mobile (375px).

---

## Phase 6: Polish & Validação Final

- [ ] T034 Configurar CORS em `backend/config/settings.py` para aceitar `http://localhost:3000` em dev e URL do Vercel em prod
- [ ] T035 [P] Criar `frontend/.eslintrc.json` e `frontend/.prettierrc` com configurações para Next.js + TypeScript
- [ ] T036 [P] Criar `backend/pytest.ini` com `DJANGO_SETTINGS_MODULE = config.settings`
- [ ] T037 Executar todos os cenários do `specs/001-pilha-call-stack/quickstart.md` e confirmar que todos os critérios de aceite (SC-001 a SC-005) são atendidos

**Checkpoint final**: Todos os testes passam (`pytest` + `npm run test`), quickstart.md validado end-to-end.

---

## Dependencies & Execution Order

### Ordem entre fases

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOQUEIA tudo abaixo
    ↓
Phase 3 (US1 — MVP)
    ↓
Phase 4 (US2 — Overflow) ← depende do PilhaVisual de US1
    ↓
Phase 5 (US3 — Educacional) ← independente, pode rodar após US1
    ↓
Phase 6 (Polish)
```

### Dentro da Phase 3

```
T017 → T018 → T019 → T020 → T021 → T022  (backend, sequencial)
                                          ↓
T023 [P] ──────────────────────────────── ambos podem iniciar após T022
T024 [P] ──────────────────────────────── 
                                          ↓
T025 → T026 → T027  (frontend, sequencial)
```

---

## Parallel Opportunities

```bash
# Phase 1 — Setup paralelo possível
T002, T006, T007, T009, T010, T011, T012  # sem dependências entre si

# Phase 3 — Backend e frontend em paralelo após T022
T023 + T024  # hooks e api.ts em paralelo
```

---

## Implementation Strategy

### MVP (apenas US1 — Phase 1 a 3)

1. Phase 1: Setup → `manage.py check` + `npm run build` ok
2. Phase 2: Stack + testes → `pytest backend/core/` verde
3. Phase 3 backend: serializer + view + testes → `pytest backend/apps/pilha/` verde
4. Phase 3 frontend: api.ts + hook + componente + page
5. **PARAR e validar**: fatorial(4) end-to-end funcionando
6. Avançar para US2 (overflow) e US3 (educacional)

### Incremental

- US1 pronto → site já funciona para o caso principal
- US2 adiciona o caso de overflow (diferencia o mini-projeto de demos genéricas)
- US3 fecha o loop educacional (o propósito real do site)
