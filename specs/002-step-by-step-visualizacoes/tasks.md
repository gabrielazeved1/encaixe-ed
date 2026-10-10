---
description: "Lista de tasks ordenada para a feature 002-step-by-step-visualizacoes"
---

# Tasks: Modo Step-by-Step nas Visualizações

**Input**: Design documents em `/specs/002-step-by-step-visualizacoes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/{api-pilha,api-bst,api-hash}.md, quickstart.md

**Testes**: incluídos — Constituição IV exige "teste antes do endpoint". Testes unitários cobrem a lógica de passos nas estruturas puras; testes de integração validam o envelope HTTP.

**Organization**: tasks agrupadas por fase. Fase 2 entrega infra compartilhada (backend `passos.py` + frontend player/narrador). Fases 3–5 fazem rollout gradual por mini-projeto (pilha → bst → hash), cada slice entrega US1 e US3 ponta a ponta para seu projeto. Fase 6 adiciona US2 (autoplay) de uma vez para os três.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: user story atendida (US1, US2, US3). Sem label = fundação/polimento.

---

## Phase 1: Setup

**Purpose**: ajustes mínimos antes de qualquer código da feature.

- [x] T001 ~~Instalar framer-motion~~ — **decidido não instalar**. O projeto é consistente em usar só Tailwind/CSS; step-by-step será animado com transições CSS curtas (150–300ms). Nenhuma dep nova.
- [x] T002 ~~Criar diretório `backend/core/estruturas/tests/`~~ — **já existe** com arquivos para todas as 7 estruturas.

**Checkpoint**: nada a fazer. Partir direto para Fase 2.

---

## Phase 2: Foundational (Shared Infrastructure)

**Purpose**: infra compartilhada que todas as user stories dependem. Nenhuma integração por projeto começa antes desta fase estar completa.

**⚠️ CRITICAL**: Phase 3+ bloqueadas até esta fase terminar.

### Backend — tipos e helper de passos

- [x] T003 Criar `backend/core/estruturas/passos.py` com `TypedDict Passo` (indice: int, descricao: str, destaques: list[str], estado: object), alias `PassoColetor = list[Passo]`, e helper `fazer_passo(coletor, descricao, destaques, estado)` que anexa um passo com `indice = len(coletor)` e asserta `descricao` não-vazia conforme data-model.md §Validações
- [x] T004 [P] Criar `backend/core/estruturas/tests/test_passos.py` cobrindo: índice denso começa em 0, `descricao` vazia dispara `AssertionError`, snapshot via `json.dumps(passo)` sucede

### Frontend — tipos, player e componentes compartilhados

- [x] T005 [P] Criar `frontend/types/passos.ts` com `Passo<E>` genérico (indice, descricao, destaques, estado) e aliases `EstadoPilha`, `EstadoBst`, `EstadoHash`, `PassoPilha`, `PassoBst`, `PassoHash` conforme data-model.md §Frontend
- [x] T006 [US1] Criar `frontend/hooks/useStepPlayer.ts` que recebe `passos: Passo<unknown>[]` e expõe `{ indice, passoAtual, avancar, voltar, resetar, totalPassos }`. Sem autoplay/velocidade nesta task — apenas navegação manual (US1). Reseta estado ao `passos` mudar (FR-010)
- [x] T007 [P] [US1] Criar `frontend/hooks/__tests__/useStepPlayer.test.ts` validando: estado inicial `indice=0`, `avancar` incrementa até `totalPassos-1`, `voltar` decrementa até 0, `resetar` volta a 0, nova lista de passos dispara reset
- [x] T008 [P] [US1] Criar `frontend/components/ui/StepControls.tsx` com botões "voltar", "próximo", "reset" + indicador textual "passo N de M". Botões ficam desabilitados nos extremos. Nenhum fetch, nenhuma lógica de passos — recebe handlers por prop
- [x] T009 [P] [US3] Criar `frontend/components/ui/StepNarrator.tsx` que recebe `descricao: string` e `destaques: string[]`, renderiza a frase em painel lateral e expõe `destaques` como prop para integração visual nos componentes de projeto

**Checkpoint**: infra compartilhada pronta. Qualquer projeto pode agora integrar o modo step-by-step. US1 e US3 já são testáveis isoladamente no player.

---

## Phase 3: User Story 1+3 — Integração Pilha (Priority: P1) 🎯 MVP

**Goal**: `/projetos/pilha` entra em modo step-by-step. Usuário dispara `fatorial(3)`, pausa, avança passo a passo vendo frames empilharem e desempilharem com descrição textual em pt-BR a cada passo.

**Independent Test**: Cenário 1 + parte do Cenário 5 do `quickstart.md` — rodar o endpoint via curl retorna `passos`, abrir `/projetos/pilha` no browser e navegar manualmente até o final.

### Backend Pilha — estrutura pura + testes

- [x] T010 [US1] Evoluir `backend/core/estruturas/stack.py`: `_simular_fatorial` e `_simular_fibonacci` aceitam `coletor: PassoColetor | None = None`. Em cada push/pop/overflow, se `coletor` fornecido, chamar `fazer_passo` com descrição em pt-BR seguindo os exemplos de `contracts/api-pilha.md` (ex.: `"Chamando fatorial(2) recursivamente. Empurrando frame na pilha."`) e `destaques=["frame:<argumento>"]`. Formato `frames` legado permanece inalterado para compat
- [x] T011 [US1] Em `simular_pilha` (mesmo arquivo), criar `coletor: PassoColetor = []`, passar para as funções recursivas e adicionar `"passos": coletor` ao dict retornado. Manter todos os campos existentes
- [x] T012 [P] [US1] Adicionar em `backend/core/estruturas/tests/test_stack.py` casos: `simular_pilha("fatorial", 1)` retorna exatamente 2 passos (push + pop) com descrições não-vazias; `simular_pilha("fatorial", 3)` retorna 6 passos com índices densos 0..5; destaques `"frame:3"` aparecem no primeiro passo; passo de overflow contém a palavra `"estourou"` ou `"overflow"` na descrição
- [x] T013 [P] [US1] Adicionar em `backend/apps/pilha/test_pilha.py` um teste de integração: POST `/api/pilha/simular/` com `{"funcao":"fatorial","valor":3}` → status 200, `response.data["passos"]` é lista não-vazia, cada item tem `indice`/`descricao`/`destaques`/`estado`

### Frontend Pilha — hook e componente visual

- [x] T014 [US1] Atualizar `frontend/hooks/usePilhaSimulacao.ts` para incluir `passos: PassoPilha[]` no tipo de retorno; `lib/api.ts` apenas repassa o JSON — nenhuma transformação
- [x] T015 [US1] [US3] Refatorar `frontend/components/projetos/PilhaVisual.tsx` para: deixar de animar `frames[]` automaticamente; receber `passos: PassoPilha[]` e usar `useStepPlayer(passos)`; renderizar `passoAtual.estado` (array de frames) com `passoAtual.destaques` destacando o frame cujo `argumento` corresponde ao id `"frame:<n>"`; renderizar `<StepControls>` abaixo e `<StepNarrator descricao={passoAtual.descricao} destaques={passoAtual.destaques} />` ao lado
- [x] T016 [P] [US1] Criar `frontend/components/projetos/__tests__/PilhaVisual.test.tsx` com um render que recebe 2 passos fake e verifica: estado inicial mostra passo 0; clicar "próximo" mostra passo 1 e sua descrição; destaque aparece no DOM com atributo `data-destaque` correspondente

**Checkpoint**: `/projetos/pilha` funciona end-to-end em modo step-by-step manual. US1 + US3 entregues para este projeto. Pronto para merge e demo isolados.

---

## Phase 4: User Story 1+3 — Integração BST (Priority: P1)

**Goal**: `/projetos/indice-bst` em modo step-by-step. Usuário monta uma BST a partir de valores e busca um alvo; cada inserção e cada comparação de busca vira um passo com texto.

**Independent Test**: Cenário 2 + Cenário 5 do `quickstart.md` para o projeto BST.

### Backend BST — estrutura pura + testes

- [x] T017 [US1] Evoluir `backend/core/estruturas/bst.py`: `BST.inserir(valor, coletor=None)` registra um passo antes de cada comparação (`"Comparando {valor} com nó {no.valor} → desce para a {esquerda|direita}."`, destaques `["no:<valor_no>"]`) e um passo final quando posição é encontrada (`"Posição vazia à {esquerda|direita} de {pai}. Inserindo {valor} ali."`, destaques `["no:<valor>"]`). Caso inserção na árvore vazia: um único passo `"Árvore vazia. Inserindo {valor} como raiz."`. `estado` em cada passo = `self.para_dict()` após eventual mutação
- [x] T018 [US1] Evoluir `BST.buscar(valor, coletor=None)` no mesmo arquivo para registrar um passo por comparação visitada, usando as mesmas descrições do fluxo de inserção adaptadas para busca; passo final descreve "Chave encontrada" ou "Chave não encontrada". Manter o retorno `{"encontrado", "passos": passos_busca}` legado — renomeá-lo para `"passos_busca"` para liberar a chave `"passos"` para o novo envelope (research.md §6)
- [x] T019 [US1] Em `simular_bst` (mesmo arquivo), criar `coletor` único, passar para cada `inserir` e para o `buscar`, e devolver `"passos": coletor` no dict final. Renomear o antigo `"passos"` para `"passos_busca"` no retorno
- [x] T020 [P] [US1] Criar `backend/core/estruturas/tests/test_bst.py` com casos: `simular_bst([50], 50)` → `passos` com 2 itens (inserção raiz + busca igual); `simular_bst([50,30,70,40], 40)` → `passos` com inserções em ordem + 3 passos de busca; descrições incluem substrings esperadas (`"raiz"`, `"esquerda"`, `"Chave encontrada"`); `destaques` referenciam valores existentes
- [x] T021 [P] [US1] Adicionar em `backend/apps/indice_bst/test_indice_bst.py` teste de integração: POST com `{"valores":[50,30,70],"alvo":30}` retorna `passos` não-vazio e `passos_busca` com formato antigo preservado

### Frontend BST

- [x] T022 [US1] Atualizar `frontend/hooks/useIndiceBST.ts` para expor `passos: PassoBst[]`
- [x] T023 [US1] [US3] Refatorar `frontend/components/projetos/IndiceBSTVisual.tsx`: usar `useStepPlayer(passos)`; renderizar `passoAtual.estado` como árvore (reusar o renderer atual); destaques `"no:<valor>"` adicionam ring/glow nos nós correspondentes; integrar `<StepControls>` e `<StepNarrator>`
- [x] T024 [P] [US1] Criar `frontend/components/projetos/__tests__/IndiceBSTVisual.test.tsx` com passos fake simulando inserção + busca verificando destaque no nó certo a cada passo

**Checkpoint**: `/projetos/indice-bst` em modo step-by-step. US1 + US3 entregues.

---

## Phase 5: User Story 1+3 — Integração Hash (Priority: P1)

**Goal**: `/projetos/busca-hash` em modo step-by-step evidenciando colisões.

**Independent Test**: Cenário 3 + Cenário 5 do `quickstart.md` para busca_hash.

### Backend Hash — estrutura pura + testes

- [x] T025 [US1] Adicionar `HashTable.para_dict()` em `backend/core/estruturas/hash_table.py` retornando `{"tamanho": self._tamanho, "buckets": [list(b) for b in self._buckets]}`
- [x] T026 [US1] Evoluir `HashTable.inserir(chave, valor, coletor=None)` para registrar: um passo com cálculo do hash e estado do bucket alvo antes de inserir (`"Inserindo \"{chave}\" → h(\"{chave}\") = {idx}. Bucket {idx} está {vazio|ocupado por X}."`, destaques `["bucket:<idx>"]`); se colisão, descrição explícita contendo a palavra `"Colisão"` conforme contracts/api-hash.md
- [x] T027 [US1] Evoluir `HashTable.buscar(chave, coletor=None)` para registrar um passo por comparação dentro do bucket; passo final `"Chave encontrada"` ou `"Chave não encontrada"` com `destaques=["bucket:<idx>"]`
- [x] T028 [US1] Em `comparar_busca` (mesmo arquivo), inserir primeiro um passo "Tabela vazia (16 buckets)." antes das inserções, criar `coletor`, propagar para todas as inserções e para a busca, e devolver `"passos": coletor` no dict final. Campos `linear` e `hash` legados permanecem
- [x] T029 [P] [US1] Criar `backend/core/estruturas/tests/test_hash_table.py` com entrada que força colisão determinística (ex.: strings cujo hash custom colide no bucket 5) e asserta: passo inicial descreve tabela vazia; existe pelo menos um passo cuja descrição contém `"Colisão"`; passo final da busca contém `"encontrada"` ou `"não encontrada"`; `destaques` do tipo `"bucket:<n>"` com `0 ≤ n < 16`
- [x] T030 [P] [US1] Adicionar em `backend/apps/busca_hash/test_busca_hash.py` teste de integração que valida presença de `passos` no response

### Frontend Hash

- [x] T031 [US1] Atualizar `frontend/hooks/useBuscaHash.ts` para expor `passos: PassoHash[]`
- [x] T032 [US1] [US3] Refatorar `frontend/components/projetos/BuscaHashVisual.tsx`: usar `useStepPlayer(passos)`; renderizar `passoAtual.estado.buckets` como grid; destaques `"bucket:<n>"` destacam a célula correspondente; integrar `<StepControls>` e `<StepNarrator>`
- [x] T033 [P] [US1] Criar `frontend/components/projetos/__tests__/BuscaHashVisual.test.tsx` com passos fake incluindo colisão verificando destaque + mensagem

**Checkpoint**: três projetos no modo step-by-step manual. MVP de US1+US3 completo em todos os projetos integrados.

---

## Phase 6: User Story 2 — Autoplay com controle de velocidade (Priority: P2)

**Goal**: adiciona play/pause/velocidade sobre o player existente. Vale automaticamente para os três projetos já integrados.

**Independent Test**: Cenário 4 do `quickstart.md` — `useStepPlayer` auto-avança com `setTimeout` e troca de velocidade afeta próximo intervalo.

- [ ] T034 [US2] Estender `frontend/hooks/useStepPlayer.ts` com estado `{ tocando: boolean, velocidade: number }` e handlers `tocar()`, `pausar()`, `setVelocidade(v)`. Enquanto `tocando` e `indice < totalPassos-1`, agendar `setTimeout(() => avancar(), INTERVALO_BASE / velocidade)`. Ao atingir fim, `tocando = false` (FR-009). Limpar timeout no `useEffect` cleanup para evitar leak
- [ ] T035 [P] [US2] Estender `frontend/hooks/__tests__/useStepPlayer.test.ts` cobrindo: `tocar()` + fake timers avança o índice; `pausar()` para a progressão; mudar velocidade enquanto toca afeta o próximo intervalo (não o atual); ao atingir último passo em autoplay, `tocando` volta a `false`
- [ ] T036 [US2] Estender `frontend/components/ui/StepControls.tsx` com botão play/pause (troca de ícone conforme `tocando`) e slider/toggle de velocidade com no mínimo 3 opções (0.5×, 1×, 2×) — FR-005. Botão play desabilitado quando `indice === totalPassos - 1`
- [ ] T037 [P] [US2] Estender `frontend/components/ui/__tests__/StepControls.test.tsx` validando: ícone muda entre play/pause conforme prop; clicar play chama handler certo; mudar slider chama `setVelocidade` com valor correto

**Checkpoint**: US2 entregue nos três projetos simultaneamente — nenhum visual precisou mudar porque o novo botão vive no `StepControls` compartilhado.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: acabamentos e validação final.

- [ ] T038 [P] Rodar `pytest` completo (`source backend/.venv/bin/activate && pytest`) e garantir que nenhum dos quatro projetos não migrados quebrou
- [ ] T039 [P] Rodar `npm run test` e `npm run lint` no frontend; corrigir warnings do strict mode
- [ ] T040 Executar manualmente os cinco cenários do `quickstart.md` em `npm run dev` e marcar cada checkbox do "Done When"
- [ ] T041 [P] Atualizar `frontend/content/projetos.ts` nos três projetos para incluir, no `textoEd`, uma frase explicando que a visualização suporta modo step-by-step (nada de inline em componente — Princípio V)
- [ ] T042 Atualizar `README.md` com uma linha mencionando a nova capacidade (seção de features, se existir)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: sem dependência externa
- **Phase 2 (Foundational)**: depende de Phase 1 — bloqueia todas as integrações por projeto
- **Phase 3 (Pilha)**: depende de Phase 2 completa
- **Phase 4 (BST)**: depende de Phase 2 completa; **independente de Phase 3** (pode rodar em paralelo com Phase 3 se outra pessoa pegar)
- **Phase 5 (Hash)**: depende de Phase 2 completa; **independente de Phase 3 e 4**
- **Phase 6 (Autoplay)**: depende de Phase 2 completa; para ser **percebido pelos usuários**, pelo menos uma das Phase 3/4/5 precisa estar entregue
- **Phase 7 (Polish)**: depende de todas as fases alvo que entrarão no release

### Dentro de cada Phase 3–5 (por projeto)

Constituição IV: ordem rígida.

1. Instrumentar estrutura pura (ex.: T010/T011 em Pilha)
2. Testes unitários da estrutura (T012)
3. Teste de integração do endpoint (T013) — valida envelope HTTP
4. Hook de fetch (T014) — frontend passa a enxergar `passos`
5. Componente visual + teste de componente (T015/T016)

### Parallel Opportunities

- **T002 || T004 || T005**: diferentes arquivos, sem dependência mútua
- **T007 || T008 || T009**: diferentes arquivos no frontend, dependem só de T005/T006 estarem no lugar
- **Phases 3, 4, 5**: podem ser desenvolvidas em paralelo por 3 pessoas diferentes após Phase 2
- Dentro de cada phase de projeto, as tasks marcadas [P] (ex.: T012 e T013 em Pilha) rodam em paralelo

---

## Implementation Strategy

### MVP (recomendado para primeira iteração)

1. Phase 1 (Setup)
2. Phase 2 (Foundational) — **crítica**
3. Phase 3 (Pilha) — fecha o loop US1+US3 em um projeto
4. **PARE E VALIDE**: Cenário 1 e parte do Cenário 5 do quickstart. Demo possível.

Nesse ponto já há valor pedagógico real entregue, mesmo que BST e Hash fiquem para a próxima iteração.

### Entrega incremental sugerida

1. Setup + Foundational → infra pronta
2. Pilha → demo (MVP)
3. BST → demo
4. Hash → demo
5. Autoplay → demo (US2 em todos de uma vez)
6. Polish → fecha

### Trabalho paralelo (se houver banda)

Após Phase 2, três slices (pilha/bst/hash) podem avançar em paralelo. O risco baixo porque cada slice toca arquivos próprios e consome a mesma infra sem alterá-la.

---

## Notes

- `[P]` = arquivos diferentes, sem dependência bloqueante
- Cada task deve ter commit próprio ou commit em grupo pequeno (research.md §6: compat preservada permite rollout gradual)
- Todas as mensagens de commit em pt-BR, imperativo, sem Co-Authored-By (CLAUDE.md)
- Cada fase 3–5 pode virar um PR separado
- Phase 6 pode virar um PR separado, aplicável às integrações já entregues
- Nenhuma task introduz dependência fora da stack travada (Princípio VI) — Framer Motion é a única dep nova possível e vem logo em T001 se ainda não existir
