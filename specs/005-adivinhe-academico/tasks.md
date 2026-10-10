---
description: "Task list — Jogo Adivinhe Modo Acadêmico Multi-camada"
---

# Tasks: Jogo Adivinhe — Modo Acadêmico Multi-camada

**Input**: `specs/005-adivinhe-academico/{spec,plan,research,data-model,quickstart}.md` + `contracts/{rodada,palpite}.md`

**Prerequisites**: feature 004 em produção; backend/frontend verdes.

**Organização**: tasks agrupadas por user story após a fase shared (foundation). US1 inclui todo o backend atualizado + MVP frontend.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência).
- **[Story]**: a qual US pertence (US1, US2, US3, US4).
- Caminhos de arquivo sempre explícitos.

---

## Phase 1: Setup

**Purpose**: nenhum pacote novo. Apenas garantir baseline verde antes de qualquer mudança.

- [ ] T001 Rodar `cd backend && source .venv/bin/activate && pytest -q` e confirmar baseline 100% verde (256 testes atuais da feature 004 passam).
- [ ] T002 Rodar `cd frontend && npm test -- --run && npm run build` e confirmar baseline 100% verde (26 testes vitest + build limpo).

**Checkpoint Setup**: baseline estabelecido. Qualquer regressão a partir daqui é falha da feature 005.

---

## Phase 2: Foundational — Camada pura compartilhada (shared por TODAS as US)

**Purpose**: construir banco de perguntas, lookup de complexidade e metadata — base que o backend e todas as US consomem.

**⚠️ CRÍTICO**: Nenhuma US pode começar antes desta fase terminar.

### Operações estendidas

- [ ] T003 Em `backend/core/jogo/tests/test_operacoes.py`, adicionar testes `test_cada_operacao_tem_nome_tecnico_nao_vazio`, `test_cada_operacao_tem_invariante_nao_vazio`, `test_cada_operacao_tem_complexidade_pior_valida` (verifica que `complexidade_pior ∈ {"O(1)","O(log n)","O(n)","O(n log n)","O(n²)","O((V+E) log V)"}`) — iterar sobre todas as operações cadastradas (depende de T001).
- [ ] T004 Em `backend/core/jogo/operacoes.py`, estender `OperacaoJogavel` com os campos `nome_tecnico: str`, `invariante: str`, `complexidade_pior: str` (dataclass frozen); preencher a metadata nas 7 instâncias de `OPERACOES` conforme tabela em `data-model.md` (depende de T003).
- [ ] T005 Rodar `cd backend && pytest core/jogo/tests/test_operacoes.py -v` e confirmar 100% verde (depende de T004).

### Complexidade — módulo novo

- [ ] T006 [P] Criar `backend/core/jogo/tests/test_complexidade.py` com `test_pior_caso_cobre_todas_operacoes` (toda `(estrutura, operacao)` em `OPERACOES` tem entrada em `PIOR_CASO`), `test_pior_caso_bate_com_metadata_de_operacao` (`PIOR_CASO[(e, op)] == OPERACOES[e][op].complexidade_pior` para toda combinação), `test_pior_caso_rejeita_operacao_desconhecida` (`pior_caso("pilha", "foo") → KeyError`) (depende de T005).
- [ ] T007 Criar `backend/core/jogo/complexidade.py` com `PIOR_CASO: dict[tuple[Estrutura, str], Complexidade]` cobrindo as 7 estruturas (ver tabela `data-model.md` seção Complexidade) e função pública `pior_caso(estrutura: str, operacao: str) -> str` que faz lookup (depende de T006).
- [ ] T008 Rodar `cd backend && pytest core/jogo/tests/test_complexidade.py -v` e confirmar 100% verde (depende de T007).

### Perguntas — banco e sorteio

- [ ] T009 [P] Criar `backend/core/jogo/tests/test_perguntas.py` com:
  - `test_banco_cobre_todas_combinacoes` (`set(BANCO.keys()) == set(itertools.product(ESTRUTURAS, CAMADAS))`),
  - `test_cada_combinacao_tem_pelo_menos_2_enunciados` (todas as entradas `len >= 2`),
  - `test_toda_pergunta_tem_4_alternativas_e_indice_valido` (`len(p.alternativas) == 4` e `0 <= p.indice_correto < 4`),
  - `test_enunciados_de_camada_estrutura_passam_na_varredura_de_neutralidade` (para toda pergunta com `camada == "estrutura"`, nenhum nome das 7 estruturas aparece em `enunciado`),
  - `test_montar_pergunta_e_deterministico_dada_mesma_seed` (duas chamadas com mesma `rng = Random(42)` produzem o mesmo retorno),
  - `test_montar_pergunta_embaralha_alternativas` (com `Random(1)` vs `Random(2)`, ordem difere na maioria dos casos),
  - `test_montar_pergunta_preserva_resposta_correta_apos_shuffle` (`retorno.alternativas[retorno.indice_correto] == pergunta_original.alternativas[pergunta_original.indice_correto]`)
  (depende de T005, T008).
- [ ] T010 Criar `backend/core/jogo/perguntas.py` com:
  - dataclass `Pergunta(camada: Camada, enunciado: str, alternativas: tuple[str, str, str, str], indice_correto: int)`,
  - constante `BANCO: dict[tuple[Estrutura, Camada], list[Pergunta]]` com pelo menos 2 enunciados por combinação, totalizando ≥42 entradas (texto completo em linguagem acadêmica — ver spec FR-008; use CLRS/Sedgewick/La Rocca como referência de tom),
  - função pública `montar_pergunta(estrutura: str, operacao: str, camada: str, rng: Random) -> Pergunta` que: (1) sorteia um `Pergunta` do `BANCO[(estrutura, camada)]` via `rng.choice`, (2) pega `correto = original.alternativas[original.indice_correto]`, (3) embaralha `alternativas` com `rng.shuffle`, (4) recalcula `indice_correto = alternativas.index(correto)`, (5) retorna novo `Pergunta` (depende de T009).
- [ ] T011 Rodar `cd backend && pytest core/jogo/tests/test_perguntas.py -v` e confirmar 100% verde (depende de T010).

### Neutralidade — varredura também de enunciados

- [ ] T012 Em `backend/core/jogo/tests/test_neutralidade.py`, adicionar `test_varredura_neutra_texto_detecta_vazamento` (string `"empurrei na pilha"` → `VazamentoDeNome`) e `test_varredura_neutra_texto_aceita_string_neutra` (string `"operação em arranjo"` passa limpo) (depende de T011).
- [ ] T013 Em `backend/core/jogo/neutralidade.py`, adicionar função pública `varredura_neutra_texto(texto: str) -> None` (recebe uma única string, varre pela mesma lista `PROIBIDAS`; mantém `varredura_neutra(passos)` intocada) (depende de T012).
- [ ] T014 Rodar `cd backend && pytest core/jogo/tests/test_neutralidade.py -v` e confirmar 100% verde (depende de T013).

### Explicações — estendidas por (estrutura, camada) × {acertou, errou}

- [ ] T015 [P] Em `backend/core/jogo/tests/test_explicacoes.py` (criar se não existir), adicionar:
  - `test_explicacoes_cobrem_todas_combinacoes` (`set(EXPLICACOES.keys()) == set(itertools.product(ESTRUTURAS, CAMADAS))`),
  - `test_cada_entrada_tem_variantes_acertou_e_errou` (toda entrada é um dict com chaves `{"acertou", "errou"}`),
  - `test_cada_texto_entre_100_e_400_chars`,
  - `test_obter_explicacao_devolve_variante_correta` (`obter_explicacao("heap", "estrutura", True)` retorna variante `acertou`)
  (depende de T011).
- [ ] T016 Em `backend/core/jogo/explicacoes.py`, substituir `EXPLICACOES: dict[Estrutura, str]` por `EXPLICACOES: dict[tuple[Estrutura, Camada], dict[Literal["acertou", "errou"], str]]` com as 21 combinações (texto acadêmico 2–3 linhas, 100–300 chars; versão v1 pode usar o mesmo texto nas duas variantes). Adicionar função pública `obter_explicacao(estrutura, camada, acertou) -> str` (depende de T015).
- [ ] T017 Rodar `cd backend && pytest core/jogo/tests/test_explicacoes.py -v` e confirmar 100% verde (depende de T016).

### Token — claims com `op`

- [ ] T018 Em `backend/core/jogo/tests/test_token.py`, atualizar/adicionar:
  - `test_roundtrip_encode_decode_preserva_claims` (encode de `{"e":"heap","op":"push_sift","s":42,"t":1000}` → decode → mesmas claims),
  - `test_decode_rejeita_claims_sem_op` (claims `{e,s,t}` sem `op` → `TokenInvalido`),
  - `test_decode_rejeita_op_desconhecida_para_estrutura` (claims `{"e":"heap","op":"xyz","s":0,"t":now}` → `TokenInvalido`),
  - os testes antigos (`test_decode_rejeita_assinatura_adulterada`, `test_decode_rejeita_timestamp_expirado`, `test_decode_rejeita_payload_malformado`, `test_decode_rejeita_estrutura_desconhecida`) continuam presentes e verdes
  (depende de T005).
- [ ] T019 Em `backend/core/jogo/token.py`:
  - atualizar `ClaimsRodada` TypedDict para incluir `op: str`,
  - em `decode()`, validar `set(claims.keys()) == {"e","op","s","t"}` e `claims["op"] in {op.nome for op in OPERACOES[claims["e"]]}`,
  - `encode()` já serializa qualquer dict ordenado — só garantir ordem canônica no `sort_keys=True`
  (depende de T018, T011 — precisa de `OPERACOES` consistente).
- [ ] T020 Rodar `cd backend && pytest core/jogo/tests/test_token.py -v` e confirmar 100% verde (depende de T019).

### Sortear — retorna pergunta de estrutura pronta

- [ ] T021 Em `backend/core/jogo/tests/test_sortear.py`, atualizar/adicionar:
  - manter `test_seed_fixo_produz_rodada_identica` (ampliar: agora `rodada.pergunta_estrutura.enunciado` e `rodada.pergunta_estrutura.alternativas` também são idênticos entre 2 chamadas com mesma seed),
  - adicionar `test_rodada_inclui_pergunta_estrutura` (campo existe, `camada == "estrutura"`, 4 alternativas),
  - adicionar `test_token_da_rodada_contem_op` (decode do token da rodada tem `claims["op"] in OPERACOES[claims["e"]]`),
  - adicionar `test_enunciado_pergunta_estrutura_passa_na_varredura_neutra`,
  - os testes antigos de neutralidade dos passos continuam (depende de T014, T011, T020).
- [ ] T022 Em `backend/core/jogo/sortear.py`:
  - atualizar `@dataclass Rodada` para incluir `pergunta_estrutura: Pergunta` (reaproveita a mesma dataclass de `perguntas.py`),
  - dentro de `sortear(seed, secret, agora)`, após gerar `passos` e passar varredura: chamar `pergunta_estrutura = montar_pergunta(estrutura, op.nome, "estrutura", rng)`,
  - encode token com claims `{"e": estrutura, "op": op.nome, "s": seed, "t": agora}`,
  - retornar `Rodada(token, passos, pergunta_estrutura)` (depende de T021).
- [ ] T023 Rodar `cd backend && pytest core/jogo/tests/test_sortear.py -v` e confirmar 100% verde (depende de T022).

### Avaliar — multi-estágio

- [ ] T024 Em `backend/core/jogo/tests/test_avaliar.py`, atualizar/adicionar:
  - remover/adaptar o teste antigo de `avaliar(token, palpite_estrutura)` que retornava `Veredito` monolítico,
  - adicionar `test_avaliar_estagio_estrutura_devolve_veredito_parcial_e_proxima_pergunta_operacao` (acertando ou errando, retorno tem `camada="estrutura"`, `acertou: bool`, `correto: str`, `explicacao: str`, `proxima_pergunta.camada == "operacao"`),
  - `test_avaliar_estagio_operacao_devolve_proxima_pergunta_complexidade`,
  - `test_avaliar_estagio_complexidade_devolve_proxima_pergunta_none` (último estágio),
  - `test_avaliar_estagio_invalido_lanca_erro` (`estagio="foo"` → `ValueError` ou similar),
  - `test_avaliar_palpite_fora_das_alternativas_lanca_PalpiteInvalido` (palpite = "xyz" quando as 4 alternativas são outras),
  - `test_avaliar_eh_deterministico_dada_mesma_seed` (duas chamadas com mesmo token/estagio/palpite retornam igual bit-a-bit),
  - preservar `test_avaliar_rejeita_token_adulterado` e `test_avaliar_rejeita_token_expirado` (adaptando payload: agora passa `estagio` e `palpite`) (depende de T017, T023, T020).
- [ ] T025 Em `backend/core/jogo/avaliar.py`:
  - renomear/estender `Veredito` para `VereditoParcial` com campos `camada, acertou, correto, explicacao, proxima_pergunta` (último `Pergunta | None`),
  - redefinir `avaliar(token_: str, estagio: str, palpite: str, secret: bytes, agora: int) -> VereditoParcial`:
    1. decode token (reusa `token.decode`),
    2. reconstruir `rng = Random(claims["s"])` **mas avançar o rng de forma determinística até o estado correspondente**: refazer o sorteio inicial (`choice` da estrutura, `choice` da operação, `op.executar(rng)` para passos, `montar_pergunta(e, op, "estrutura", rng)`, `montar_pergunta(e, op, "operacao", rng)`, `montar_pergunta(e, op, "complexidade", rng)`) para que o `rng` chegue no mesmo estado determinístico da rodada original e as perguntas sejam idênticas às enviadas,
    3. pegar `pergunta_atual` conforme `estagio`,
    4. validar `palpite in pergunta_atual.alternativas` (senão `PalpiteInvalido`),
    5. computar `acertou = (palpite == pergunta_atual.alternativas[pergunta_atual.indice_correto])`, `correto = pergunta_atual.alternativas[pergunta_atual.indice_correto]`, `explicacao = obter_explicacao(e, estagio, acertou)`,
    6. computar `proxima_pergunta`: se `estagio == "estrutura"` → pergunta de operação; se `"operacao"` → pergunta de complexidade; se `"complexidade"` → `None`,
    7. retornar `VereditoParcial(...)` (depende de T024).
- [ ] T026 Rodar `cd backend && pytest core/jogo/tests/test_avaliar.py -v` e confirmar 100% verde (depende de T025).

**Checkpoint Foundational**: toda camada pura pronta e verde. Pode começar US1. **Commit**: `feat(jogo): adiciona metadata em operacoes, banco de perguntas, complexidade, explicacoes multi-camada e multi-estagio em avaliar (puro)`.

---

## Phase 3: User Story 1 — Fluxo multi-camada end-to-end (Priority: P1) 🎯 MVP

**Goal**: aluno completa 1 rodada: observa passos, responde 3 perguntas em sequência, vê veredito final com 3 cards + pontuação.

**Independent Test**: cenário 2 do quickstart passa (3 perguntas → veredito funcional com 3 cards).

### Endpoint `/rodada` atualizado

- [ ] T027 [US1] Em `backend/apps/jogo_adivinhe/tests.py`, atualizar/adicionar:
  - `test_rodada_response_inclui_pergunta_estrutura` (response tem `pergunta_estrutura` com `camada`, `enunciado`, `alternativas: [4]`),
  - `test_rodada_response_tem_token_e_passos` (preservado da feature 004),
  - `test_rodada_com_seed_eh_reproduzivel` (preservado, agora inclui ordem das alternativas idênticas) (depende de T023).
- [ ] T028 [US1] Em `backend/apps/jogo_adivinhe/serializers.py`, adicionar `PerguntaReveladaSerializer` (campos `camada`, `enunciado`, `alternativas`) e campo `pergunta_estrutura: PerguntaReveladaSerializer()` no `RodadaResponseSerializer` existente (depende de T027).
- [ ] T029 [US1] Em `backend/apps/jogo_adivinhe/views.py`, atualizar `RodadaView.get`:
  - após chamar `sortear.sortear(seed, _secret(), agora)`, converter `rodada.pergunta_estrutura` (Pergunta com `indice_correto`) para `PerguntaRevelada` (dict sem `indice_correto`, com `alternativas: list[str]`),
  - serializar response completa com `{token, passos, pergunta_estrutura}` (depende de T028).
- [ ] T030 [US1] Rodar `cd backend && pytest apps/jogo_adivinhe/tests.py -v -k rodada` e confirmar verde (depende de T029).

### Endpoint `/palpite` atualizado — fluxo multi-estágio

- [ ] T031 [US1] Em `backend/apps/jogo_adivinhe/tests.py`, substituir os testes antigos de `/palpite` por:
  - `test_palpite_estagio_estrutura_acerto_devolve_proxima_pergunta_operacao` (POST com estagio="estrutura" + palpite correto → `{camada:"estrutura", acertou:true, correto, explicacao, proxima_pergunta: {camada:"operacao", ...}}`),
  - `test_palpite_estagio_estrutura_erro_tambem_devolve_proxima_pergunta` (palpite errado também avança),
  - `test_palpite_estagio_operacao_devolve_proxima_pergunta_complexidade`,
  - `test_palpite_estagio_complexidade_devolve_proxima_pergunta_null`,
  - `test_palpite_estagio_invalido_retorna_400` (estagio="foo"),
  - `test_palpite_palpite_fora_das_alternativas_retorna_400`,
  - `test_palpite_token_adulterado_retorna_401` (adaptação),
  - `test_palpite_token_expirado_retorna_404` (adaptação — payload agora inclui `estagio` e `palpite`),
  - `test_palpite_para_mesmo_token_estagio_eh_idempotente` (depende de T026).
- [ ] T032 [US1] Em `backend/apps/jogo_adivinhe/serializers.py`:
  - atualizar `PalpiteRequestSerializer` para campos `token: CharField`, `estagio: ChoiceField(choices=["estrutura","operacao","complexidade"])`, `palpite: CharField`,
  - criar `VereditoParcialSerializer` com campos `camada`, `acertou`, `correto`, `explicacao`, `proxima_pergunta: PerguntaReveladaSerializer(allow_null=True)` (depende de T031).
- [ ] T033 [US1] Em `backend/apps/jogo_adivinhe/views.py`, atualizar `PalpiteView.post`:
  - validar via `PalpiteRequestSerializer`,
  - chamar `avaliar.avaliar(token, estagio, palpite, _secret(), agora)`,
  - mapear exceções: `PalpiteInvalido → 400`, `TokenExpirado → 404 "rodada expirada"`, `TokenInvalido → 401 "token inválido"`, `ValueError (estagio inválido) → 400 "estagio inválido"`,
  - converter `VereditoParcial` para response: incluir `proxima_pergunta` convertida para `PerguntaRevelada` (sem `indice_correto`) ou `null` (depende de T032).
- [ ] T034 [US1] Rodar `cd backend && pytest apps/jogo_adivinhe/tests.py -v` e confirmar 100% verde (depende de T033).

### Checkpoint backend — rodar suíte completa

- [ ] T035 [US1] Rodar `cd backend && pytest -q` e confirmar 100% verde (nenhuma regressão na suíte completa; features 001–003 intactas) (depende de T034).

### Frontend — tipos e componentes neutros

- [ ] T036 [US1] [P] Em `frontend/lib/api.ts`, adicionar/atualizar tipos:
  - `Camada = "estrutura" | "operacao" | "complexidade"`,
  - `PerguntaRevelada = { camada: Camada; enunciado: string; alternativas: [string, string, string, string] }`,
  - `RodadaResult = { token: string; passos: PassoJogo[]; pergunta_estrutura: PerguntaRevelada }` (atualizar),
  - `VereditoParcial = { camada: Camada; acertou: boolean; correto: string; explicacao: string; proxima_pergunta: PerguntaRevelada | null }`,
  - `VereditoFinal = { pontuacao: 0 | 1 | 2 | 3; camadas: { estrutura: VereditoParcial; operacao: VereditoParcial; complexidade: VereditoParcial } }` (frontend-only, type helper),
  - substituir função `postPalpite(token, palpite)` por `postPalpite(token: string, estagio: Camada, palpite: string): Promise<VereditoParcial>`,
  - remover tipo antigo `VereditoResult` e export `Estrutura` continua existindo (ainda usado) (depende de T035).

- [ ] T037 [US1] [P] Criar `frontend/components/jogo/PerguntaAcademica.tsx` (`"use client"`) com props `{ pergunta: PerguntaRevelada; selecionada: number | null; onSelecionar: (idx: number) => void; onConfirmar: () => void; desabilitado: boolean }`. Layout:
  - enunciado em `<p>` com `prose` do Tailwind (texto maior, line-height confortável),
  - grid 1 coluna de 4 botões, cada um mostrando `A/B/C/D` + atalho `1/2/3/4` + texto da alternativa, com estado selecionado destacado por borda azul,
  - botão `Confirmar` abaixo, desabilitado quando `selecionada === null` ou `desabilitado` (depende de T036).

- [ ] T038 [US1] [P] Criar `frontend/components/jogo/ProgressoRodada.tsx` com props `{ camadaAtual: Camada; vereditosParciais: VereditoParcial[] }`. Renderiza:
  - título "Pergunta X de 3" (X = 1 + número de vereditos parciais),
  - 3 dots horizontais; dot atual destacado (azul); dots já respondidos coloridos verde/âmbar conforme veredito (depende de T036).

- [ ] T039 [US1] [P] Criar `frontend/components/jogo/VereditoFinal.tsx` com props `{ vereditos: [VereditoParcial, VereditoParcial, VereditoParcial]; pontuacao: 0 | 1 | 2 | 3; onProxima: () => void }`. Layout:
  - header com pontuação em estrelas (ex.: "⭐⭐☆" para 2/3), número grande centralizado,
  - grid responsive (1 col mobile / 3 cols desktop) com 3 cards (um por camada), cada card:
    - ícone ✓ (verde) ou ✕ (âmbar),
    - título com nome da camada ("Estrutura" / "Operação" / "Complexidade"),
    - resposta correta destacada,
    - explicação em texto comum,
  - botão "Próxima rodada →" ao final (depende de T036).

### Frontend — hook reescrito

- [ ] T040 [US1] Em `frontend/hooks/useAdivinheRodada.ts`, reescrever o hook:
  - state: `{ estado: "carregando" | "respondendo" | "veredito" | "erro"; rodada: RodadaResult | null; perguntaAtual: PerguntaRevelada | null; vereditosParciais: VereditoParcial[]; pontuacao: 0|1|2|3 | null; erro: string | null }`,
  - função `carregarRodada(seed?: number)` → chama `getRodada`, popula estado em "respondendo" com `perguntaAtual = rodada.pergunta_estrutura`, zera vereditosParciais,
  - função `enviarPalpite(palpite: string)` → chama `postPalpite(token, camadaAtual, palpite)`:
    - acumula `veredito` em `vereditosParciais`,
    - se `veredito.proxima_pergunta !== null` → `perguntaAtual = proxima_pergunta`, continua "respondendo",
    - se `null` → calcular `pontuacao = vereditosParciais.filter(v => v.acertou).length` (0-3), transição para "veredito",
  - função `proximaRodada()` → chama `carregarRodada()` (sem seed; aleatório),
  - preservar `useRef(false)` para evitar dupla init no mount (depende de T036).

### Frontend — client reescrito

- [ ] T041 [US1] Reescrever `frontend/app/adivinhe/AdivinheClient.tsx` (`"use client"`) como máquina de estados:
  - usa `useAdivinheRodada(seedInicial)`,
  - mantém `const [indicePasso, setIndicePasso]`,
  - mantém `const [selecionada, setSelecionada] = useState<number | null>(null)` — reseta ao mudar `perguntaAtual`,
  - layout:
    - header com `ProgressoRodada` (quando `estado === "respondendo"`),
    - estado `"carregando"` → `<p>Sorteando rodada…</p>`,
    - estado `"respondendo"` → grid `lg:grid-cols-2 gap-6`: coluna esquerda com `StepNarrator` + `PassosGenericoVisual` + `StepControls`; coluna direita com `PerguntaAcademica`,
    - estado `"veredito"` → `VereditoFinal` em tela cheia (sem coluna de passos),
    - estado `"erro"` → mensagem + botão "Sortear nova rodada",
  - handler `onConfirmar()` do `PerguntaAcademica`: pega `pergunta.alternativas[selecionada!]` e chama `enviarPalpite(...)` (depende de T037, T038, T039, T040).

- [ ] T042 [US1] Em `frontend/app/adivinhe/page.tsx`, confirmar que continua repassando `seedInicial` para `AdivinheClient` sem mudanças (depende de T041).

- [ ] T043 [US1] Deletar arquivos obsoletos:
  - `frontend/components/jogo/Veredito.tsx` (substituído por `VereditoFinal.tsx`),
  - `frontend/components/jogo/BotoesPalpite.tsx` (não é mais usado) (depende de T041).

### Frontend — testes

- [ ] T044 [US1] [P] Em `frontend/__tests__/useAdivinheRodada.test.ts` (criar/atualizar), cobrir com `vi.fn` mock de `fetch`:
  - `carrega rodada e popula pergunta de estrutura`,
  - `enviar palpite correto de estrutura avança para operação`,
  - `enviar palpite de complexidade transita para veredito e calcula pontuação`,
  - `tratamento de erro 404 token expirado seta estado erro` (depende de T040).

- [ ] T045 [US1] [P] Em `frontend/__tests__/VereditoFinal.test.tsx` (criar), renderizar com dados mock (3 vereditos + pontuação) e verificar: 3 cards presentes, cada um com nome da camada, resposta correta, explicação; estrelas correspondem à pontuação (depende de T039).

- [ ] T046 [US1] [P] Em `frontend/__tests__/PerguntaAcademica.test.tsx` (criar), renderizar com pergunta mock, verificar que 4 botões A/B/C/D aparecem; clicar botão B seta `selecionada=1`; botão Confirmar está desabilitado quando `selecionada=null` (depende de T037).

### Checkpoint frontend — build + tests

- [ ] T047 [US1] Rodar `cd frontend && npm test -- --run && npm run build` e confirmar que todos os testes (26+ atuais + novos) passam e o build compila sem erros TypeScript nem warnings de lint (depende de T044, T045, T046, T042, T043).

### Validação manual US1

- [ ] T048 [US1] Teste manual: subir backend+frontend, abrir `http://localhost:3000/adivinhe`, rodar cenário 2 do quickstart (fluxo end-to-end: 3 perguntas → veredito funcional). Verificar que não há regressão visual na home (`/`) nem nos 7 projetos (depende de T047).

**Checkpoint US1**: MVP acadêmico pronto. **Commits sugeridos**:
- `feat(jogo): atualiza endpoint /rodada para incluir pergunta_estrutura`
- `feat(jogo): atualiza endpoint /palpite para fluxo multi-estagio`
- `feat(jogo): adiciona componentes PerguntaAcademica, ProgressoRodada, VereditoFinal`
- `feat(jogo): reescreve AdivinheClient como maquina de estados multi-camada`

---

## Phase 4: User Story 2 — Atalhos de teclado (Priority: P2)

**Goal**: rodada completável só com teclado (`1-4`, `Enter`, `←`/`→`, `espaço`).

**Independent Test**: cenário 4 do quickstart passa (rodada inteira sem mouse).

- [ ] T049 [US2] [P] Em `frontend/__tests__/useAtalhosRodada.test.ts` (criar), com `renderHook` e `fireEvent.keyDown` no `document`:
  - teclas `1`,`2`,`3`,`4` chamam `onNumero` com índice correto,
  - `Enter` chama `onConfirmar`,
  - `ArrowLeft` chama `onEsquerda`,
  - `ArrowRight` chama `onDireita`,
  - `Space` chama `onDireita` (alias),
  - callbacks NÃO são chamados quando o foco está em `<input>` / `<textarea>` (depende de T047).

- [ ] T050 [US2] Criar `frontend/hooks/useAtalhosRodada.ts` com assinatura:
  ```ts
  useAtalhosRodada(callbacks: {
    onNumero?: (idx: 0 | 1 | 2 | 3) => void;
    onConfirmar?: () => void;
    onEsquerda?: () => void;
    onDireita?: () => void;
  }, deps?: unknown[]): void
  ```
  Internamente usa `useEffect` com listener global de `keydown` no `document`. Antes de disparar callback, verifica `document.activeElement` — se for `INPUT` ou `TEXTAREA`, ignora (depende de T049).

- [ ] T051 [US2] Em `frontend/app/adivinhe/AdivinheClient.tsx`, integrar `useAtalhosRodada` passando callbacks que:
  - `onNumero(idx)` → `setSelecionada(idx)` (só quando `estado === "respondendo"`),
  - `onConfirmar()` → chamar `onConfirmar` do PerguntaAcademica (só quando `selecionada !== null`),
  - `onEsquerda()` → `setIndicePasso((i) => Math.max(0, i-1))`,
  - `onDireita()` → `setIndicePasso((i) => Math.min(total-1, i+1))` (depende de T050).

- [ ] T052 [US2] Em `frontend/components/jogo/PerguntaAcademica.tsx`, destacar visualmente o atalho (ex.: `kbd` com número `1-4` dentro do botão) para que o aluno saiba qual tecla pressionar (depende de T051).

- [ ] T053 [US2] Rodar `cd frontend && npm test -- --run` e confirmar que `useAtalhosRodada.test.ts` passa + nenhum teste anterior quebrou (depende de T052).

- [ ] T054 [US2] Teste manual: rodar cenário 4 do quickstart (completar rodada só com teclado) (depende de T053).

**Checkpoint US2**: UX de teclado pronta. **Commit**: `feat(jogo): adiciona atalhos de teclado 1-4 Enter setas espaco`.

---

## Phase 5: User Story 3 — Banco variado e enunciados elaborados (Priority: P2)

**Goal**: ≥42 enunciados-base no banco, cada um academicamente elaborado (estilo CLRS / Sedgewick / prova de ED). US1 já implementou o esqueleto do banco; US3 é verificação formal + enriquecimento qualitativo.

**Independent Test**: cenário 6 do quickstart passa (script Python conta ≥42 e verifica estrutura).

- [ ] T055 [US3] Em `backend/core/jogo/perguntas.py`, revisar o `BANCO` cadastrado em T010 e garantir que cada entrada `BANCO[(estrutura, camada)]` tem **exatamente ou mais que 2** enunciados; para combinações que ainda só têm 1, adicionar uma 2a variação (texto ≠, mesmas 4 alternativas podem ser idênticas ou variantes) (depende de T047).

- [ ] T056 [US3] Em `backend/core/jogo/tests/test_perguntas.py`, reforçar os testes:
  - adicionar `test_banco_tem_pelo_menos_42_perguntas_no_total` (`sum(len(v) for v in BANCO.values()) >= 42`),
  - adicionar `test_enunciados_sao_distintos_dentro_de_cada_combinacao` (dentro de `BANCO[(e, c)]`, `len({p.enunciado for p in lista}) == len(lista)` — zero duplicatas) (depende de T055).

- [ ] T057 [US3] Rodar `cd backend && pytest core/jogo/tests/test_perguntas.py -v` e confirmar que os novos testes passam (depende de T056).

- [ ] T058 [US3] Revisar manualmente os ≥42 enunciados por qualidade acadêmica: cada enunciado deve ter 1-3 frases, vocabulário técnico (termos como "arranjo", "ordem parcial", "função de dispersão", "relaxamento", "percurso ascendente"), e estilo de prova universitária. Ajustar textos que soarem muito coloquiais (depende de T057).

- [ ] T059 [US3] Rodar `cd backend && pytest -q` e confirmar 100% verde (depende de T058).

- [ ] T060 [US3] Teste manual: jogar 20 rodadas com seeds variadas e amostrar que ≥2 enunciados distintos aparecem por camada (não é sempre o mesmo texto) (depende de T059).

**Checkpoint US3**: banco variado + acadêmico. **Commit**: `feat(jogo): enriquece banco de perguntas com variacoes e tom academico`.

---

## Phase 6: User Story 4 — Polish do veredito final (Priority: P3)

**Goal**: `VereditoFinal` com estrelas de pontuação, destaques de cor refinados, animação de entrada, grid responsive polido.

**Independent Test**: cenário 7 do quickstart passa (21 explicações legíveis e visualmente bem compostas).

- [ ] T061 [US4] Em `frontend/components/jogo/VereditoFinal.tsx`, substituir pontuação textual por 3 estrelas visuais SVG (⭐⭐⭐ preenchidas / vazias conforme `pontuacao`); número grande "X / 3" ao lado (depende de T054 ou T047).

- [ ] T062 [US4] Em `frontend/components/jogo/VereditoFinal.tsx`, adicionar animação de entrada nos 3 cards (fade-in + translate-y staggered via Tailwind `animate-in` ou `transition` com delay por index 0/100/200ms) (depende de T061).

- [ ] T063 [US4] Em `frontend/components/jogo/VereditoFinal.tsx`, ajustar grid responsive:
  - mobile: 1 coluna, cards full-width,
  - tablet (`md:`): 1 coluna com cards mais estreitos,
  - desktop (`lg:`): 3 colunas horizontais (depende de T061).

- [ ] T064 [US4] Em `frontend/components/jogo/VereditoFinal.tsx`, destaque visual da resposta correta: envolver em `<strong className="text-emerald-300">` quando acertou, em `<strong className="text-amber-300">` quando errou; sublinhar com `underline underline-offset-4` (depende de T063).

- [ ] T065 [US4] Em `frontend/__tests__/VereditoFinal.test.tsx` (já criado em T045), adicionar casos:
  - `pontuacao=3 renderiza 3 estrelas preenchidas`,
  - `pontuacao=0 renderiza 3 estrelas vazias`,
  - `cards acertou têm texto emerald e cards errou têm texto amber` (depende de T064).

- [ ] T066 [US4] Rodar `cd frontend && npm test -- --run && npm run build` e confirmar verde (depende de T065).

- [ ] T067 [US4] Teste manual: rodar cenário 7 do quickstart; verificar visual em 3 larguras (375px, 768px, 1440px) via DevTools (depende de T066).

**Checkpoint US4**: polimento visual pronto. **Commit**: `feat(jogo): polish visual do veredito final (estrelas, cores, animacao)`.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: validação final.

- [ ] T068 Rodar `cd backend && pytest -q` e confirmar 100% verde na suíte completa (todos os testes antigos + novos — target >= 290 testes).

- [ ] T069 Rodar `cd frontend && npm test -- --run && npm run build` e confirmar verde (target >= 30 testes vitest).

- [ ] T070 Executar `specs/005-adivinhe-academico/quickstart.md` passo a passo, marcar os 10 cenários como validados.

- [ ] T071 Atualizar `MEMORY.md` apenas se alguma decisão desta feature precisar ser lembrada em sessões futuras (ex.: "jogo multi-camada: backend stateless; frontend acumula vereditos parciais; token tem `op`"). Se não há nada que não possa ser derivado do spec/plan, pular.

- [ ] T072 Commit final do spec kit: `docs(005): marca tasks concluídas (manuais pendentes de validação em browser)`.

---

## Dependencies & Execution Order

### Fase

- **Setup (T001–T002)**: baseline. Sem dependências.
- **Foundational (T003–T026)**: shared por todas as US. Bloqueia tudo.
- **US1 (T027–T048)**: depende de Foundational completa.
- **US2 (T049–T054)**: depende de US1 completa.
- **US3 (T055–T060)**: depende de US1 completa (precisa do BANCO estabelecido para refinar).
- **US4 (T061–T067)**: depende de US1 completa (precisa de `VereditoFinal.tsx` existente).
- **Polish (T068–T072)**: depende de todas as US.

### Dentro da Foundational — ordem crítica

```
T001/T002 → T003 → T004 → T005
                            ↓
                     T006/T009/T015 (paralelo entre si)
                            ↓
                     T007/T010/T016
                            ↓
                     T008/T011/T017
                            ↓
                     T012 → T013 → T014
                            ↓
                     T018 → T019 → T020  (depende de T005 + T011)
                            ↓
                     T021 → T022 → T023  (depende de T014 + T011 + T020)
                            ↓
                     T024 → T025 → T026  (depende de T017 + T023 + T020)
```

### Dentro de US1

```
T027 → T028 → T029 → T030  (endpoint /rodada)
T031 → T032 → T033 → T034  (endpoint /palpite)
                      ↓
                     T035  (checkpoint backend)
                      ↓
         T036 → T037/T038/T039 (paralelo) → T040 → T041 → T042/T043
                                                            ↓
                                        T044/T045/T046 (paralelo)
                                                            ↓
                                                           T047
                                                            ↓
                                                           T048
```

### Paralelismo

**Camada pura (Foundational)**: T006, T009, T015 podem rodar em paralelo (arquivos diferentes). T003 bloqueia T004 (mesmo arquivo).

**Frontend (US1)**: T037, T038, T039 em paralelo (componentes diferentes). T044, T045, T046 em paralelo (testes diferentes).

**Entre US2, US3, US4**: podem ser feitas por 3 devs em paralelo após US1 fechar. US2 edita `AdivinheClient.tsx` + `PerguntaAcademica.tsx`; US3 edita `perguntas.py`; US4 edita `VereditoFinal.tsx`. Zero overlap.

---

## Implementation Strategy

### MVP first

**MVP = US1 completa**. 48 tasks, mas a feature inteira é jogável end-to-end ao final (apenas sem atalhos de teclado e com UX menos polida).

### Incremental delivery

1. Fechar Foundational (commit único após T026 verde).
2. Fechar backend US1 (commit após T035).
3. Fechar frontend US1 (commit após T047).
4. Validar MVP manual (T048) — pode fazer merge se quiser release intermediário.
5. US2 → commit.
6. US3 → commit.
7. US4 → commit.
8. Polish → commit final.

### Guardrails

- Após **cada task de teste pytest/vitest**, rodar o teste e confirmar verde antes de avançar.
- Após **cada task de implementação**, rodar `pytest -q` (backend) ou `npm test -- --run && npm run build` (frontend) para detectar regressão imediatamente.
- Qualquer teste da feature 004 que ficar vermelho é blocker — não avançar.
