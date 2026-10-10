---

description: "Task list — Jogo Adivinhe a Estrutura"
---

# Tasks: Jogo "Adivinhe a Estrutura"

**Input**: Design documents em `/specs/004-jogo-adivinhe-estrutura/`

**Prerequisites**: spec.md, plan.md, research.md, data-model.md, contracts/rodada.md, contracts/palpite.md, quickstart.md (todos presentes).

**Testes**: SIM — Constituição IV exige teste pytest antes de qualquer endpoint. Todas as funções puras em `core/jogo/` ganham testes antes da implementação, e os 2 endpoints ganham testes de contrato em `apps/jogo_adivinhe/tests.py`.

**Organização**: tarefas agrupadas por user story depois das fases Setup + Foundational (que neste caso incluem o token HMAC — compartilhado por todas as US).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralelizável (arquivos diferentes, sem dependências pendentes).
- **[Story]**: a qual user story a task pertence.
- Todos os paths são absolutos a partir da raiz do repositório.

## Path Conventions

- Backend puro: `backend/core/jogo/` (NOVO)
- Backend endpoint: `backend/apps/jogo_adivinhe/` (NOVO)
- Testes backend puros: `backend/core/jogo/tests/`
- Testes backend endpoint: `backend/apps/jogo_adivinhe/tests.py`
- Frontend rota: `frontend/app/adivinhe/`
- Frontend componentes: `frontend/components/jogo/`
- Frontend hook: `frontend/hooks/useAdivinheRodada.ts`
- Frontend API: `frontend/lib/api.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: criar o pacote `core/jogo/` e o app Django `jogo_adivinhe/` com esqueletos mínimos para o resto das tarefas poder tocar o filesystem no lugar certo.

- [ ] T001 Criar `backend/core/jogo/__init__.py` vazio e `backend/core/jogo/tests/__init__.py` vazio (novo pacote puro).
- [ ] T002 Criar `backend/apps/jogo_adivinhe/__init__.py`, `apps.py` (classe `JogoAdivinheConfig` com `name = "apps.jogo_adivinhe"`) e `urls.py` vazio (`urlpatterns = []`). Registrar `apps.jogo_adivinhe` em `INSTALLED_APPS` em `backend/config/settings.py` e incluir `path("api/jogo_adivinhe/", include("apps.jogo_adivinhe.urls"))` em `backend/config/urls.py`.
- [ ] T003 Rodar `cd backend && pytest -q` e confirmar que a suíte continua 100% verde (111 testes atuais da feature 003 permanecem passando após adicionar o app vazio).

**Checkpoint Setup**: esqueletos no lugar, baseline verde.

---

## Phase 2: Foundational — Token HMAC (Blocking Prerequisites)

**Purpose**: o token stateless é usado por AMBOS os endpoints — US1 inteira depende dele. Isolado em uma fase própria porque é a camada mais baixa (sem dependências) e deve estar sólido antes do sorteador tocá-lo.

### Tests for Foundational

- [ ] T004 Criar `backend/core/jogo/tests/test_token.py` com `test_roundtrip_encode_decode_preserva_claims` (encode de `{"e": "heap", "s": 42, "t": 1000}` → decode → mesmas claims) e `test_decode_rejeita_assinatura_adulterada` (trocar último char do token → `TokenInvalido`) e `test_decode_rejeita_timestamp_expirado` (encode com `t = now - 3700` → `TokenExpirado` quando `TTL_SEGUNDOS = 3600`) e `test_decode_rejeita_payload_malformado` (string sem `.`, base64 inválido, JSON inválido → `TokenInvalido`) e `test_decode_rejeita_estrutura_desconhecida` (claims com `e="treap"` assinadas corretamente → `TokenInvalido`).

### Implementation for Foundational

- [ ] T005 Criar `backend/core/jogo/token.py` com: constantes `TTL_SEGUNDOS = 3600` e `ESTRUTURAS_VALIDAS = {"pilha", "fila", "heap", "hash", "bst", "linkedlist", "grafo"}`; exceções `TokenInvalido`, `TokenExpirado`; função `encode(claims: ClaimsRodada, secret: bytes) -> str` que serializa JSON ordenado, base64url, assina com HMAC-SHA256 e concatena com `.`; função `decode(token: str, secret: bytes, agora: int | None = None) -> ClaimsRodada` que split em `.`, verifica assinatura em tempo constante com `hmac.compare_digest`, parseia claims, valida `e in ESTRUTURAS_VALIDAS`, valida `agora - claims["t"] < TTL_SEGUNDOS` (depende de T004).
- [ ] T006 Rodar `cd backend && pytest core/jogo/tests/test_token.py -v` e confirmar 100% verde (depende de T005).

**Checkpoint Foundational**: token stateless pronto. **Commit**: `feat(jogo): adiciona token HMAC stateless para rodadas`.

---

## Phase 3: User Story 1 — Jogar uma rodada e receber veredito (Priority: P1) 🎯 MVP

**Goal**: fluxo completo — abrir `/adivinhe`, ver passos sem rótulo de estrutura, palpitar, receber veredito com estrutura correta + explicação. Backend inteiro + frontend básico.

**Independent Test**: cenários 1 a 4 do `quickstart.md` passam de ponta a ponta.

### Tests for US1 — Backend puro

- [ ] T007 [P] [US1] Criar `backend/core/jogo/tests/test_operacoes.py` com um teste por estrutura (`test_pilha_push_pop_produz_passos_com_destaque_topo`, `test_fila_enqueue_dequeue_produz_destaques_inicio_fim`, `test_heap_push_mostra_sift`, `test_hash_colisao_mostra_bucket`, `test_bst_mostra_descida_esquerda_direita`, `test_linkedlist_mostra_percurso_linear`, `test_grafo_dijkstra_4nos_mostra_aresta`) — cada teste importa a operação de `core/jogo/operacoes.py`, executa com `random.Random(0)` e verifica que `len(passos) >= 2` e que algum destaque contém o fingerprint esperado.
- [ ] T008 [P] [US1] Criar `backend/core/jogo/tests/test_sortear.py` com: `test_seed_fixo_produz_rodada_identica` (`sortear(42)` chamado 2× → mesma estrutura, mesmos passos bit-a-bit), `test_sem_seed_sorteia_estruturas_variadas` (100 chamadas sem seed cobrem pelo menos 5 das 7 estruturas), `test_sortear_sempre_retorna_pelo_menos_2_passos` (50 seeds, todas com `len(passos) >= 2`), `test_sortear_devolve_estrutura_valida` (nome retornado ∈ `ESTRUTURAS_VALIDAS`).
- [ ] T009 [P] [US1] Criar `backend/core/jogo/tests/test_neutralidade.py` com `test_100_rodadas_sem_vazamento_de_nome` (sortear com seeds `range(100)`, para cada rodada rodar `varredura_neutra(passos)` → nunca lança) e `test_varredura_detecta_substrings_proibidas` (injetar passo com descrição `"empurrei na pilha"` → lança `VazamentoDeNome`; testar case-insensitive com `"HEAP cheio"`).
- [ ] T010 [P] [US1] Criar `backend/core/jogo/tests/test_explicacoes.py` com `test_7_estruturas_tem_explicacao` (dict `EXPLICACOES` tem exatamente as 7 chaves de `ESTRUTURAS_VALIDAS`) e `test_explicacoes_nao_tem_placeholders` (nenhum valor contém "TODO", "FIXME", "[NEEDS CLARIFICATION]" ou está vazio).
- [ ] T011 [P] [US1] Criar `backend/core/jogo/tests/test_avaliar.py` com `test_avaliar_acerto_retorna_true_e_explicacao`, `test_avaliar_erro_retorna_false_mas_revela_correta`, `test_avaliar_token_invalido_levanta_TokenInvalido`, `test_avaliar_token_expirado_levanta_TokenExpirado`, `test_avaliar_palpite_fora_da_lista_valida_levanta_PalpiteInvalido`, `test_avaliar_idempotente` (3 chamadas com mesmo token+palpite → mesma resposta).

### Implementation for US1 — Backend puro

- [ ] T012 [US1] Criar `backend/core/jogo/operacoes.py` com dataclass `OperacaoJogavel(estrutura: str, nome: str, executar: Callable[[random.Random], list[Passo]])` e constante `OPERACOES: dict[str, list[OperacaoJogavel]]` com UMA entrada por estrutura: `pilha` → `push_pop` (3 pushes random + 1 pop), `fila` → `enqueue_dequeue` (3 enqueues + 1 dequeue), `heap` → `push_sift` (4 pushes mostrando sift-up), `hash` → `inserir_colidir_buscar` (3 chaves pré-calculadas em colisão + 1 busca), `bst` → `inserir_buscar` (4 inserts + 1 search), `linkedlist` → `push_insert_remove` (push + insert_at + remove_at), `grafo` → `dijkstra_4nos` (grafo A-B-C-D com arestas fixas, Dijkstra A→D). Cada `executar` instancia a estrutura real de `core/estruturas/*.py`, usa `PassoColetor` da feature 002 para capturar passos, retorna a lista (depende de T007).
- [ ] T013 [US1] Criar `backend/core/jogo/neutralidade.py` com constante `PROIBIDAS = {"pilha", "stack", "fila", "queue", "heap", "monte", "hash", "tabela hash", "bst", "árvore binária", "arvore binaria", "linkedlist", "linked list", "lista encadeada", "grafo", "graph", "dijkstra", "bfs"}`; exceção `VazamentoDeNome`; função `varredura_neutra(passos: list[Passo]) -> None` que concatena `descricao + " ".join(destaques) + json.dumps(estado)` de todos os passos, lowercase, verifica cada substring de `PROIBIDAS` com `in`; levanta `VazamentoDeNome` se achar (depende de T009).
- [ ] T014 [US1] Criar `backend/core/jogo/sortear.py` com dataclass `Rodada(token: str, passos: list[Passo])` e função `sortear(seed: int | None, secret: bytes, agora: int) -> Rodada`: se `seed is None`, gerar `seed = secrets.randbits(32)`; criar `rng = random.Random(seed)`; sortear estrutura ∈ `ESTRUTURAS_VALIDAS`; escolher `random.choice(OPERACOES[estrutura])`; executar; rodar `varredura_neutra`; se falhar OU `len(passos) < 2`, re-sortear até 10 tentativas; se estourar levantar `RuntimeError("não foi possível gerar rodada neutra em 10 tentativas")`; encode token com claims `{"e": estrutura, "s": seed, "t": agora}` (depende de T005, T012, T013).
- [ ] T015 [US1] Criar `backend/core/jogo/explicacoes.py` com dict `EXPLICACOES: dict[str, str]` com texto de 1-2 frases por estrutura (ver research.md D6 para conteúdo exato: LIFO/topo para pilha, FIFO/início-fim para fila, sift pai-filho para heap, bucket+probing para hash, esq/dir binária para bst, pos-N linear para linkedlist, aresta-relaxamento para grafo) (depende de T010).
- [ ] T016 [US1] Criar `backend/core/jogo/avaliar.py` com dataclass `Veredito(acertou: bool, estrutura_correta: str, explicacao: str)`; exceção `PalpiteInvalido`; função `avaliar(token: str, palpite: str, secret: bytes, agora: int) -> Veredito`: valida `palpite in ESTRUTURAS_VALIDAS` (senão levanta `PalpiteInvalido`); chama `token.decode` (pode levantar `TokenInvalido` ou `TokenExpirado`); monta `Veredito(acertou=(palpite == claims["e"]), estrutura_correta=claims["e"], explicacao=EXPLICACOES[claims["e"]])` (depende de T005, T011, T015).
- [ ] T017 [US1] Rodar `cd backend && pytest core/jogo/tests -v` e confirmar 100% verde (depende de T012–T016).

### Implementation for US1 — Endpoint /rodada

- [ ] T018 [US1] Criar `backend/apps/jogo_adivinhe/serializers.py` com `RodadaQuerySerializer` tendo `seed = serializers.IntegerField(required=False, min_value=0)` (depende de T017).
- [ ] T019 [US1] Criar view `RodadaView(APIView)` em `backend/apps/jogo_adivinhe/views.py` com `get(request)` que: valida querystring com `RodadaQuerySerializer`; chama `sortear(seed=validated.get("seed"), secret=settings.SECRET_KEY.encode(), agora=int(time.time()))`; retorna `Response({"token": rodada.token, "passos": rodada.passos})`; captura `RuntimeError` (10 tentativas estouradas) e retorna `Response({"detail": "..."}, status=500)` (depende de T018).
- [ ] T020 [US1] Adicionar `path("rodada", RodadaView.as_view())` em `backend/apps/jogo_adivinhe/urls.py` (depende de T019).
- [ ] T021 [US1] Criar `backend/apps/jogo_adivinhe/tests.py` com testes de contrato de /rodada (listados em `contracts/rodada.md > Testes de contrato`): `test_rodada_tem_token_e_passos` (GET sem seed → 200 + campos), `test_rodada_seed_fixo_e_reprodutivel` (GET `?seed=42` duas vezes → payloads idênticos), `test_rodada_seed_invalido_retorna_400` (GET `?seed=-1` → 400), `test_rodada_passos_minimo_2` (20 rodadas, `len(passos) >= 2` em todas), `test_rodada_sem_vazamento_de_nome` (50 rodadas sorteadas, nenhum campo contém substrings proibidas) (depende de T020).
- [ ] T022 [US1] Rodar `cd backend && pytest apps/jogo_adivinhe/tests.py -v` e confirmar 100% verde (depende de T021).

### Implementation for US1 — Endpoint /palpite

- [ ] T023 [US1] Adicionar `PalpiteSerializer` em `backend/apps/jogo_adivinhe/serializers.py` com `token = serializers.CharField()` e `palpite = serializers.ChoiceField(choices=["pilha", "fila", "heap", "hash", "bst", "linkedlist", "grafo"])` (depende de T022).
- [ ] T024 [US1] Criar `PalpiteView(APIView)` em `backend/apps/jogo_adivinhe/views.py` com `post(request)` que: valida body com `PalpiteSerializer`; chama `avaliar(token, palpite, secret=settings.SECRET_KEY.encode(), agora=int(time.time()))`; captura `TokenInvalido` → `Response({"detail": "token inválido"}, status=401)`; captura `TokenExpirado` → `Response({"detail": "rodada expirada"}, status=404)`; retorno normal → `Response({"acertou": v.acertou, "estrutura_correta": v.estrutura_correta, "explicacao": v.explicacao})` (depende de T023).
- [ ] T025 [US1] Adicionar `path("palpite", PalpiteView.as_view())` em `backend/apps/jogo_adivinhe/urls.py` (depende de T024).
- [ ] T026 [US1] Expandir `backend/apps/jogo_adivinhe/tests.py` com testes de contrato de /palpite (listados em `contracts/palpite.md > Testes de contrato`): `test_palpite_acerto_retorna_acertou_true` (end-to-end: pegar rodada com seed fixo, decodificar token com `token.decode` para saber `e`, palpitar `e` → `acertou=true`), `test_palpite_erro_retorna_acertou_false_mas_revela_estrutura`, `test_palpite_invalido_retorna_400` (palpite `"treap"` → 400), `test_palpite_token_adulterado_retorna_401`, `test_palpite_token_expirado_retorna_404` (forjar token com `t = now - 3700`), `test_palpite_idempotente` (3 chamadas → 3 respostas idênticas) (depende de T025).
- [ ] T027 [US1] Rodar `cd backend && pytest apps/jogo_adivinhe/tests.py -v` e confirmar 100% verde (depende de T026).

### Implementation for US1 — Frontend

- [ ] T028 [US1] Adicionar `getRodada(seed?: number): Promise<{token: string, passos: Passo[]}>` e `postPalpite(token: string, palpite: Estrutura): Promise<{acertou: boolean, estrutura_correta: string, explicacao: string}>` em `frontend/lib/api.ts`, usando o mesmo padrão de `fetch` + base URL dos outros projetos. Exportar o type `Estrutura = "pilha" | "fila" | "heap" | "hash" | "bst" | "linkedlist" | "grafo"` (depende de T027).
- [ ] T029 [P] [US1] Criar `frontend/hooks/useAdivinheRodada.ts` com estado interno `{rodada: Rodada | null, veredito: Veredito | null, carregando: boolean, erro: string | null}` e funções `carregarRodada(seed?: number)` e `enviarPalpite(palpite: Estrutura)` que delegam para `lib/api.ts` (depende de T028).
- [ ] T030 [P] [US1] Criar `frontend/components/jogo/PassosGenericoVisual.tsx` que recebe `{passos: Passo[], passoAtual: number}` e renderiza APENAS: (a) descrição do passo em caixa de texto, (b) pills coloridas para cada destaque, (c) painel do `estado` serializado como JSON pretty-printed. SEM SVG, SEM diagrama estrutura-específico (research.md D5) (depende de T028).
- [ ] T031 [P] [US1] Criar `frontend/components/jogo/BotoesPalpite.tsx` que renderiza 7 botões (Pilha, Fila, Heap, Hash, BST, LinkedList, Grafo), aceita prop `onPalpite: (e: Estrutura) => void` e prop `desabilitado: boolean`; quando desabilitado, botões ficam acinzentados (depende de T028).
- [ ] T032 [P] [US1] Criar `frontend/components/jogo/Veredito.tsx` que recebe `{veredito: {acertou, estrutura_correta, explicacao}}` e renderiza ícone de check/x, nome da estrutura correta e texto da explicação (depende de T028).
- [ ] T033 [US1] Criar `frontend/app/adivinhe/AdivinheClient.tsx` (`"use client"`) que usa `useAdivinheRodada`, renderiza `StepControls` + `StepNarrator` (feature 002) + `PassosGenericoVisual` + `BotoesPalpite` + condicional `Veredito`; no mount chama `carregarRodada()` (depende de T029, T030, T031, T032).
- [ ] T034 [US1] Criar `frontend/app/adivinhe/page.tsx` como server-component simples que importa e renderiza `<AdivinheClient />` (depende de T033).
- [ ] T035 [US1] Rodar `cd frontend && npm run build` e confirmar que compila sem erros TypeScript ou lint (depende de T034).
- [ ] T036 [US1] Teste manual: subir backend+frontend, abrir `http://localhost:3000/adivinhe`, verificar cenários 2-4 do quickstart (passos renderizados, nenhum rótulo de estrutura visível, palpite retorna veredito sem reload) (depende de T035).

**Checkpoint US1**: MVP completo — jogar 1 rodada end-to-end. **Commits sugeridos**:
- `feat(jogo): adiciona operações, sorteador e varredura de neutralidade`
- `feat(jogo): adiciona avaliador e explicações`
- `feat(jogo): adiciona endpoints /rodada e /palpite`
- `feat(jogo): adiciona rota /adivinhe com fluxo de palpite`

---

## Phase 4: User Story 2 — Trocar de rodada sem recarregar (Priority: P2)

**Goal**: botão "Próxima" dispara nova rodada no mesmo lugar, sem navegação.

**Independent Test**: cenário 5 do quickstart passa (10 rodadas via "Próxima" sem mudar URL).

### Implementation for US2

- [ ] T037 [US2] Em `frontend/components/jogo/Veredito.tsx`, adicionar prop `onProxima: () => void` e renderizar botão "Próxima" ao lado da explicação (depende de T036).
- [ ] T038 [US2] Em `frontend/app/adivinhe/AdivinheClient.tsx`, criar handler `aoClicarProxima()` que chama `useAdivinheRodada.carregarRodada()` (resetando `veredito` para null internamente) e passar como prop para `<Veredito onProxima={...} />` (depende de T037).
- [ ] T039 [US2] Rodar cenário 5 do quickstart: 10 cliques consecutivos em "Próxima"; verificar que URL permanece `/adivinhe` e cada rodada é diferente (depende de T038).

**Checkpoint US2**: fluxo iterativo pronto. **Commit**: `feat(jogo): adiciona botao proxima para encadear rodadas`.

---

## Phase 5: User Story 3 — Semente reprodutível via querystring (Priority: P3)

**Goal**: `?seed=42` carrega sempre a mesma rodada.

**Independent Test**: cenário 6 do quickstart passa (duas abas com mesma seed = mesma rodada).

### Implementation for US3

- [ ] T040 [US3] Em `frontend/app/adivinhe/page.tsx`, ler `searchParams.seed` (via prop padrão de Next.js App Router) e passar como prop opcional para `<AdivinheClient seedInicial={...} />` (depende de T039).
- [ ] T041 [US3] Em `frontend/app/adivinhe/AdivinheClient.tsx`, aceitar prop `seedInicial?: number` e usar como argumento na primeira chamada `carregarRodada(seedInicial)`. Chamadas subsequentes de "Próxima" NÃO devem repassar a seed (deve virar aleatório) (depende de T040).
- [ ] T042 [US3] Rodar cenário 6 do quickstart: abrir `/adivinhe?seed=42` em dois contextos → mesma rodada bit-a-bit; clicar "Próxima" → nova rodada aleatória (depende de T041).

**Checkpoint US3**: compartilhamento por URL. **Commit**: `feat(jogo): aceita seed via querystring para rodadas reproduziveis`.

---

## Phase 6: User Story 4 — Entrada do jogo na home (Priority: P3)

**Goal**: card visível em `/` que leva para `/adivinhe`.

**Independent Test**: cenário 7 do quickstart passa.

### Implementation for US4

- [ ] T043 [US4] Em `frontend/app/page.tsx`, adicionar um card/seção (seguir o visual dos cards de projeto existentes) com título "Adivinhe a Estrutura", subtítulo curto ("teste sua intuição — identifique a estrutura pela mecânica") e `<Link href="/adivinhe">` como wrapper. Posicionar antes ou depois da lista dos 7 projetos — alinhado com o layout atual (depende de T042).
- [ ] T044 [US4] Rodar cenário 7 do quickstart: visitar `/`, localizar o card, clicar → navega para `/adivinhe` (depende de T043).

**Checkpoint US4**: descoberta na home. **Commit**: `feat(home): adiciona card do jogo adivinhe a estrutura`.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: validação final da feature inteira.

- [ ] T045 Rodar `cd backend && pytest -q` e confirmar que todos os testes antigos permanecem verdes + novos testes (`core/jogo/tests` e `apps/jogo_adivinhe/tests.py`) estão presentes e verdes.
- [ ] T046 Rodar `cd frontend && npm run build && npm run test` e confirmar que ambos passam.
- [ ] T047 Executar `specs/004-jogo-adivinhe-estrutura/quickstart.md` passo a passo, marcar os 8 cenários como validados (checklist final).
- [ ] T048 Rodar manualmente o cenário 8 (expiração) com `TTL_SEGUNDOS` temporariamente reduzido, OU verificar que `test_palpite_token_expirado_retorna_404` cobre o caminho — restaurar `TTL_SEGUNDOS = 3600` ao final.
- [ ] T049 Atualizar `MEMORY.md` do projeto apenas se alguma decisão desta feature precisar ser lembrada em sessões futuras (ex.: "jogo usa token HMAC stateless; secret é SECRET_KEY do Django; não trocar por armazenamento mutável sem motivo forte").

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001–T003)**: nenhuma dependência; roda primeiro.
- **Foundational Token (T004–T006)**: depende de Setup; BLOQUEIA toda US que use token (US1, 2, 3 — ou seja, todas menos a US4).
- **US1 (T007–T036)**: depende de Foundational.
- **US2 (T037–T039)**: depende de US1 (frontend).
- **US3 (T040–T042)**: depende de US1 (frontend).
- **US4 (T043–T044)**: depende SÓ de que `/adivinhe` exista como rota — ou seja, após T034 (final do bloco frontend de US1). Pode ser feita em paralelo com US2/US3.
- **Polish (T045–T049)**: depende de todas as US desejadas.

### Within User Story 1 (ordem rígida)

Testes puros em paralelo (T007, T008, T009, T010, T011) → implementações puras em sequência (T012 → T013 → T014 → T015 → T016 → T017) → endpoint /rodada (T018 → T019 → T020 → T021 → T022) → endpoint /palpite (T023 → T024 → T025 → T026 → T027) → frontend (T028 → T029/T030/T031/T032 em paralelo → T033 → T034 → T035 → T036).

### Parallel Opportunities

**Dentro da US1 (testes puros)**: T007, T008, T009, T010, T011 — 5 arquivos distintos, zero overlap.

**Dentro da US1 (componentes frontend)**: T029, T030, T031, T032 — 4 arquivos distintos, dependem só de T028.

**Entre US2, US3, US4** (depois que US1 terminou): T037–T039 (US2), T040–T042 (US3), T043–T044 (US4) podem ser feitas em paralelo por 3 devs diferentes — zero overlap de arquivos (US2 toca `Veredito.tsx` + `AdivinheClient.tsx`; US3 toca `page.tsx` + `AdivinheClient.tsx`; US4 toca `app/page.tsx` da home). ATENÇÃO: US2 e US3 **ambas** editam `AdivinheClient.tsx` — serializar quem edita primeiro para evitar conflito.

---

## Parallel Example: dividir entre devs

```bash
# Depois do Checkpoint Foundational (token pronto):

# Dev A — US1 Backend puro (T007–T017)
Task: "Testes puros + implementação de operacoes/sortear/neutralidade/avaliar/explicacoes em core/jogo/"

# Dev B — US1 Endpoints (depois de Dev A terminar)
Task: "Views magras /rodada e /palpite + tests.py do app jogo_adivinhe"

# Dev C — US1 Frontend (depois de Dev B terminar)
Task: "Rota /adivinhe, hook, componentes neutros, integração com API"

# Depois do Checkpoint US1:
# Dev D paralelo — US2 Próxima rodada
# Dev E paralelo — US3 Seed
# Dev F paralelo — US4 Card na home
```

---

## Implementation Strategy

### MVP First (US1 apenas)

1. Completar Setup (T001–T003) + Foundational (T004–T006).
2. Completar US1 (T007–T036) — fluxo end-to-end jogável.
3. **PARAR e VALIDAR**: cenários 1–4 do quickstart passam.
4. Deploy/demo se pronto.

### Incremental delivery

1. Setup + Foundational → base pronta.
2. US1 → MVP jogável. Deploy/demo.
3. US2 → fluxo iterativo. Deploy/demo.
4. US3 → compartilhamento por URL. Deploy/demo.
5. US4 → descoberta na home. Deploy/demo.
6. Polish → validação final.

### Ordem recomendada (serial, menor risco primeiro)

1. T001–T003 (Setup).
2. T004–T006 (Token) → commit.
3. T007–T017 (Backend puro US1) → commit.
4. T018–T022 (Endpoint /rodada) → commit.
5. T023–T027 (Endpoint /palpite) → commit.
6. T028–T036 (Frontend US1) → commit.
7. T037–T039 (US2 Próxima) → commit.
8. T040–T042 (US3 Seed) → commit.
9. T043–T044 (US4 Home) → commit.
10. T045–T049 (Polish).

---

## Notes

- Cada task tem escopo de 1 arquivo (ou poucos arquivos relacionados) e produz um diff pequeno.
- Depois do commit de cada US, atualizar o checkbox desta `tasks.md` e rodar o `pytest` inteiro antes de abrir o próximo commit.
- `SECRET_KEY` do Django precisa estar presente em todos os ambientes (dev, test, prod) — já é requisito do Django, nada novo.
- Nenhuma estrutura em `core/estruturas/*.py` é alterada por esta feature. Se um teste de T007 falhar porque uma descrição menciona o nome da estrutura, a correção é em `core/jogo/operacoes.py` (passando valores que não disparem a descrição ofensiva) OU reportar como bug separado da feature 003.
