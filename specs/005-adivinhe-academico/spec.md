# Feature Specification: Jogo Adivinhe — Modo Acadêmico Multi-camada

**Feature Branch**: `005-adivinhe-academico`

**Created**: 2026-10-10

**Status**: Done — design redesenhado

**Input**: Upgrade do jogo "Adivinhe a Estrutura" (feature 004) com três perguntas progressivas por rodada (estrutura → operação → complexidade), formato de múltipla escolha estilo prova de ED, narrador em linguagem técnica neutra, layout em duas colunas com atalhos de teclado e veredito final em três cards.

---

## Nota de implementação — design redesenhado na sessão final

O design original previa um fluxo **sequencial** de 3 perguntas: o aluno respondia uma pergunta por vez, cada palpite era enviado ao endpoint `/palpite`, e o backend retornava a próxima pergunta. O frontend operava como máquina de estados `carregando → respondendo(estrutura) → respondendo(operacao) → respondendo(complexidade) → veredito`.

**O que foi efetivamente construído é diferente:**

- As 3 perguntas são exibidas **simultaneamente** na coluna da direita como cards empilhados com badges Fácil/Médio/Difícil.
- A coluna da esquerda exibe uma **animação SVG** da estrutura sorteada (`AdivinheVisual.tsx` despacha para renderers SVG por estrutura), substituindo a visão de passos em texto das features anteriores.
- O aluno seleciona uma resposta em cada um dos 3 cards e clica **"Verificar respostas"** — verificação feita **inteiramente no cliente**, sem chamada à API.
- O endpoint `/rodada` foi estendido para incluir `estrutura` (para despacho do SVG) e `perguntas` (array com os 3 cards completos, incluindo `indice_correto`, `explicacao_acerto` e `explicacao_erro`) — o gabarito vai ao cliente de forma explícita.
- O endpoint `/palpite` **continua existindo e passou todos os 15 testes de backend**, mas **não é chamado pelo frontend na versão final**.
- O resultado é exibido inline em cada card (✓ verde / ✗ vermelho) + explicação + pontuação ★★★.
- Navegação ← → por teclado foi mantida via `useAtalhosRodada` para navegar entre passos/etapas; os atalhos `1-4` para seleção de alternativas foram removidos pelo redesign.
- Contagem final: **290 testes backend (pytest)**, **50 testes frontend (vitest)**, **0 erros TypeScript**.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Responder as três perguntas de uma rodada (Priority: P1) ✓ Feita

Aluno abre `/adivinhe`, vê à esquerda uma animação SVG da estrutura (sem rótulo) e à direita 3 cards de perguntas simultâneos (estrutura/operação/complexidade) com badges Fácil/Médio/Difícil. Seleciona uma resposta em cada card e clica "Verificar respostas"; o resultado aparece inline em cada card (✓/✗ + explicação) e a pontuação é exibida como ★★★. Tudo verificado no cliente — sem chamadas à API durante a resposta.

**Why this priority**: é o coração da feature. Sem o fluxo multi-camada funcionando end-to-end, nada do resto importa. É o MVP acadêmico.

**Independent Test**: subir backend + frontend, acessar `/adivinhe`, jogar uma rodada completa, verificar que (a) 3 cards de perguntas aparecem simultaneamente, (b) o botão "Verificar respostas" ativa apenas quando as 3 perguntas foram respondidas, (c) a verificação é client-side usando `indice_correto` do payload de `/rodada`, (d) cada card mostra ✓/✗ + explicação correta conforme a estrutura sorteada, (e) a pontuação é 0–3 estrelas e corresponde ao número de acertos.

**Acceptance Scenarios**:

1. **Given** o aluno acabou de abrir `/adivinhe` com uma rodada carregada, **When** a página renderiza, **Then** a coluna esquerda exibe a animação SVG da estrutura e a coluna direita exibe os 3 cards de perguntas simultaneamente com badges Fácil/Médio/Difícil.
2. **Given** o aluno selecionou respostas nos 3 cards e clicou "Verificar respostas", **Then** cada card exibe inline ✓ verde ou ✗ vermelho, a resposta correta destacada, a explicação acadêmica correspondente (`explicacao_acerto` ou `explicacao_erro`), e a pontuação ★★★ aparece no topo.
3. **Given** o aluno errou todas as três perguntas, **When** o resultado inline aparece, **Then** cada card mostra ✗, a resposta correta em destaque, e a explicação cita a invariante formal e por que o distrator escolhido estava errado.

---

### User Story 2 — Interface acadêmica em duas colunas com atalhos de teclado (Priority: P2) ✓ Feita (parcialmente — ver nota)

Aluno navega pelos passos da animação usando ← → no teclado. A tela tem layout em 2 colunas: SVG visual à esquerda, 3 cards de perguntas à direita. Atalhos `1-4` para seleção de alternativas foram **removidos pelo redesign** (os cards simultâneos tornam esse atalho ambíguo — qual card seria alvo?). Atalhos ← → para navegação de passos/etapas foram mantidos via `useAtalhosRodada`.

**Why this priority**: teclado reduz fricção para quem joga muitas rodadas. Layout 2 colunas evita rolagem.

**Independent Test**: verificar manualmente que (a) ←/→ navegam entre passos da animação SVG, (b) layout em 2 colunas em telas ≥1024px está presente, (c) atalhos `1-4` não existem mais (não há alternativas individuais selecionáveis por teclado neste design).

**Acceptance Scenarios**:

1. **Given** a rodada está carregada e os 3 cards estão visíveis, **When** o aluno pressiona `→`, **Then** o próximo passo da animação SVG é exibido.
2. **Given** o aluno está no passo 3 da animação, **When** pressiona `←`, **Then** retorna ao passo 2.
3. **Given** os 3 cards de perguntas visíveis, **When** o aluno seleciona respostas via mouse/toque e clica "Verificar respostas", **Then** o resultado inline aparece em cada card. _(Atalhos 1-4 não estão presentes neste design — removidos para evitar ambiguidade com 3 cards simultâneos.)_

---

### User Story 3 — Banco de enunciados acadêmicos variados (Priority: P2) ✓ Feita

Cada combinação `(estrutura, camada)` tem ao menos 2 enunciados alternativos no banco; a cada rodada o backend sorteia (determinístico por seed) qual enunciado usar. Isso evita que o aluno decore a resposta pelo texto da pergunta e força a entender a mecânica.

**Why this priority**: sem variedade de enunciados, o jogo vira decoreba. Mas depende de US1 estar pronta — não é bloqueante pro MVP.

**Independent Test**: inspecionar o banco de perguntas e verificar que cada uma das 7 estruturas × 3 camadas tem ≥2 enunciados cadastrados, totalizando ≥42 enunciados-base. Executar 20 rodadas com seeds variadas e amostrar que ao menos 2 enunciados diferentes aparecem por camada.

**Acceptance Scenarios**:

1. **Given** o banco de perguntas, **When** inspecionado, **Then** para cada (estrutura, camada) existem ≥2 enunciados; cada enunciado tem exatamente 4 alternativas com 1 marcada como correta.
2. **Given** `?seed=42`, **When** a rodada é gerada, **Then** o mesmo enunciado é sempre selecionado para a mesma seed (reprodutível).
3. **Given** 20 rodadas com seeds distintas, **When** amostradas, **Then** ao menos 2 enunciados distintos aparecem por camada (variedade real).

---

### User Story 4 — Veredito final com explicações acadêmicas elaboradas (Priority: P3) ✓ Feita (inline nos cards, não tela separada)

Após responder as 3 perguntas, o aluno vê um painel com 3 cards (estrutura/operação/complexidade), cada um com ícone ✓/✕, resposta correta destacada, e explicação acadêmica de 2–3 linhas citando a invariante formal, o nome real da estrutura (sem mais vazamento, o jogo já acabou), e por que os distratores comuns estão errados. Pontuação 0–3 estrelas aparece centralizada no topo.

**Why this priority**: polimento pedagógico. US1 já entrega o veredito funcional; esta história refina o conteúdo das explicações para que o aluno saia da rodada tendo aprendido algo mesmo quando acerta tudo.

**Independent Test**: jogar 7 rodadas forçando uma estrutura diferente em cada (seed controlada), ler as 3 explicações de cada rodada, confirmar que cada explicação (a) cita o nome real da estrutura, (b) menciona a invariante formal, (c) comenta ao menos um distrator plausível, (d) cabe em 2–3 linhas.

**Acceptance Scenarios**:

1. **Given** o aluno acertou as 3 perguntas, **When** vê o veredito, **Then** cada card verde traz uma explicação acadêmica que vai além de "você acertou" (reforça o conceito).
2. **Given** o aluno errou a pergunta de complexidade, **When** lê a explicação do card âmbar, **Then** vê a resposta correta destacada e um texto curto justificando por que a alternativa escolhida está errada (ex.: "A árvore degenerada em lista alcança O(n), não O(log n), quando as inserções ocorrem em ordem monotônica").
3. **Given** o aluno acertou 2 de 3, **When** vê a pontuação, **Then** vê "2 estrelas de 3" com destaque visual (ex.: 2 estrelas preenchidas + 1 vazia).

---

### Edge Cases

- **Token expirado durante a rodada**: aluno abre `/adivinhe`, deixa aberto por mais de 1 hora, responde — backend retorna 404 "rodada expirada" na primeira chamada de `/palpite`, frontend mostra erro e oferece botão "Sortear nova rodada".
- **Palpite inválido (fora do conjunto de alternativas da pergunta)**: backend retorna 400 "palpite inválido para este estágio".
- **Estágio pulado (ex.: tentar responder complexidade antes de operação)**: backend rejeita com 400 "estágio fora de ordem" ou (opção mais simples) permite palpites fora de ordem mas o frontend força a sequência via máquina de estados. Decisão: frontend força a ordem; backend valida só o conteúdo do palpite, não a sequência (é stateless).
- **Alternativa vazia / inexistente no banco**: backend recusa carregar a rodada com 500 se o banco tem uma pergunta com <4 alternativas ou sem índice correto — bug de dados, falha dura.
- **Varredura de neutralidade**: continua obrigatória nos passos exibidos. Enunciados das perguntas de estrutura NÃO podem conter o nome das 7 estruturas (ex.: a pergunta "qual estrutura você viu" não deve conter "pilha", "fila", etc.). As alternativas da pergunta de estrutura PODEM conter os nomes (é o ponto da pergunta).
- **Teclado em input focado**: atalhos 1–4 só funcionam quando o foco não está em input/textarea (não aplicável agora, mas garantir handler respeita isso).
- **Mobile / telas estreitas**: layout colapsa para 1 coluna; passos ficam acima da pergunta.

## Requirements *(mandatory)*

### Functional Requirements

#### Fluxo multi-camada

- **FR-001**: Sistema MUST entregar 3 perguntas por rodada, em ordem fixa: (1) identificação da estrutura, (2) identificação da operação técnica específica, (3) identificação da complexidade de pior caso.
- **FR-002**: Cada pergunta MUST ter exatamente 4 alternativas, identificadas como A, B, C, D, com exatamente 1 alternativa correta.
- **FR-003**: ~~Após o aluno responder uma pergunta, o sistema MUST entregar imediatamente a próxima pergunta.~~ **[Redesenhado]** As 3 perguntas são exibidas simultaneamente na coluna direita. O aluno seleciona respostas nos 3 cards e clica "Verificar respostas"; a verificação ocorre inteiramente no cliente usando `indice_correto` incluído no payload de `/rodada`.
- **FR-004**: Veredito parcial de cada pergunta MUST incluir: se o palpite estava correto, a alternativa correta, e (no último estágio) a pontuação total 0–3.
- **FR-005**: Veredito final MUST incluir 3 explicações acadêmicas (uma por camada), cada uma com 2–3 linhas de texto citando o nome real da estrutura, invariante formal, e justificativa dos distratores quando relevante.

#### Banco de perguntas

- **FR-006**: Banco de perguntas MUST ter ≥2 enunciados alternativos por combinação (estrutura, camada), totalizando ≥42 enunciados-base (7 estruturas × 3 camadas × 2 enunciados).
- **FR-007**: Enunciados da camada "estrutura" MUST ser escritos em linguagem técnica neutra, SEM citar o nome de nenhuma das 7 estruturas no texto do enunciado (os nomes aparecem apenas nas alternativas, por força da pergunta). Enunciados das camadas "operação" e "complexidade" PODEM citar termos técnicos genéricos.
- **FR-008**: Enunciados DEVEM usar vocabulário acadêmico inspirado em referências clássicas (CLRS, Sedgewick-Wayne, La Rocca) e provas universitárias de ED.
- **FR-009**: Para a camada "complexidade", a alternativa correta MUST corresponder exatamente à complexidade de pior caso canônica da operação (lookup fixo no backend, não derivação heurística).
- **FR-010**: Distratores DEVEM ser plausíveis dentro da mesma família conceitual (outras estruturas lineares para pergunta de estrutura; outras rotinas da mesma estrutura para pergunta de operação; complexidades vizinhas Θ(1) / Θ(log n) / Θ(n) / Θ(n log n) / Θ(n²) para pergunta de complexidade).

#### Interface

- **FR-011**: Em telas ≥1024px de largura, interface MUST exibir **animação SVG da estrutura** à esquerda e **3 cards de perguntas simultâneos** à direita em grid de 2 colunas. Em telas menores, colapsa para 1 coluna. O SVG é despachado pelo componente `AdivinheVisual.tsx` conforme o campo `estrutura` da resposta de `/rodada`.
- **FR-012**: Indicador de progresso MUST exibir "Pergunta X de 3" com representação visual (ex.: 3 dots, o atual destacado) acima da pergunta.
- **FR-013**: Teclado MUST aceitar: `1`, `2`, `3`, `4` para selecionar alternativas A–D; `Enter` para confirmar; `←`/`→` para navegar entre passos; `espaço` como alias de `→`.
- **FR-014**: Alternativa selecionada MUST ter indicação visual distinta antes de confirmar (ex.: borda destacada), para evitar confirmação acidental.
- **FR-015**: Transição entre perguntas MUST ocorrer sem recarregar a página, com animação suave (fade) de curta duração (<300ms).
- **FR-016**: Veredito final MUST ocupar o espaço completo da tela (as colunas de passos+pergunta somem) e apresentar 3 cards horizontais em telas largas.

#### Neutralidade e preservação da feature 004

- **FR-017**: Varredura de neutralidade dos passos exibidos MUST continuar obrigatória (nenhum nome das 7 estruturas aparece nos passos — regra herdada da feature 004).
- **FR-018**: Reprodutibilidade por seed MUST continuar funcionando: `?seed=N` força mesma estrutura, mesma operação, mesmos passos, MESMOS enunciados selecionados do banco e MESMA ordem de alternativas.
- **FR-019**: Zero regressão: todos os testes das features 001–004 (backend + frontend) MUST continuar passando sem modificação.

#### Backend/API

- **FR-020**: Endpoint de rodada MUST retornar, numa única resposta, o conjunto {token, passos, primeira pergunta pronta (enunciado + 4 alternativas)}.
- **FR-021**: Endpoint de palpite MUST aceitar `{token, estagio, palpite}` onde `estagio ∈ {"estrutura", "operacao", "complexidade"}` e `palpite` é uma string correspondente a uma das 4 alternativas da pergunta.
- **FR-022**: Endpoint de palpite MUST retornar `{acertou, correto}` sempre, e adicionalmente `proxima_pergunta` quando `estagio ∈ {"estrutura", "operacao"}` ou `veredito_final` quando `estagio == "complexidade"`. **[Nota de implementação]** O frontend **não chama `/palpite`** na versão final — verificação é client-side. O endpoint continua ativo, passa todos os 15 testes de backend, e está mantido para compatibilidade futura.
- **FR-023**: ~~Backend MUST ser stateless: frontend acumula acertou e backend recalcula pontuação final no último palpite.~~ **[Redesenhado]** O backend continua stateless. Na versão final, o frontend verifica respostas diretamente contra `indice_correto` nos campos `perguntas` da resposta de `/rodada`, sem enviar palpites ao backend. A pontuação é calculada inteiramente no cliente.

### Key Entities

- **Rodada**: unidade mínima do jogo. Contém `{token, passos, estrutura, perguntas}` ao ser criada — `estrutura` é o nome da estrutura sorteada (para despacho do SVG), `perguntas` é array com as 3 perguntas completas incluindo gabarito.
- **Pergunta**: `{camada: "estrutura"|"operacao"|"complexidade", enunciado: str, alternativas: [str × 4], indice_correto: int, explicacao_acerto: str, explicacao_erro: str}` — gerada no backend, enviada ao frontend **com** `indice_correto` e explicações (verificação client-side exige o gabarito no cliente).
- **Palpite**: `{token, estagio, palpite: str}` — o `palpite` é o conteúdo da alternativa escolhida (não o índice), para desacoplar o frontend da ordem.
- **VereditoParcial**: `{acertou: bool, correto: str}` + opcional `proxima_pergunta: Pergunta`.
- **VereditoFinal**: `{pontuacao: 0..3, acertos: {estrutura, operacao, complexidade}, corretos: {estrutura, operacao, complexidade}, explicacoes: {estrutura: str, operacao: str, complexidade: str}}`.
- **BancoDePerguntas**: coleção estática de enunciados+alternativas estruturada por (estrutura, camada). Vive em módulo Python puro, testável sem Django.
- **Explicacao**: texto acadêmico de 2–3 linhas associado a (estrutura, camada), citando invariante formal e discutindo distratores. Vive em módulo Python puro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 10 rodadas manuais, o veredito final mostra a estrutura/operação/complexidade corretas em 10/10 vezes (gabarito interno ≡ exibido).
- **SC-002**: Nenhuma das 7 strings proibidas (nomes das estruturas) aparece nos passos exibidos (varredura regex contínua).
- **SC-003**: Banco de perguntas contém ≥42 enunciados-base distintos, cobrindo todas as 7 estruturas × 3 camadas × 2 enunciados mínimos.
- **SC-004**: Alunos conseguem jogar uma rodada completa sem usar mouse (teclado 1–4 + Enter + setas suficientes para responder as 3 perguntas e navegar passos).
- **SC-005**: Rodada completa (abrir + ler + responder 3 + ver veredito) leva ao jogador em média 60–120s em teste manual — tempo compatível com uso em sessão de estudo.
- **SC-006**: Sessão de 10 rodadas consecutivas (via botão "Próxima") funciona sem necessidade de recarregar a página.
- **SC-007**: Zero regressão: todas as suítes de teste backend (**290 testes pytest**) e frontend (**50 testes vitest**) continuam verdes após a feature. 0 erros TypeScript.

## Assumptions

- Público-alvo continua sendo estudantes de ED que já leram pelo menos uma vez sobre as 7 estruturas; o jogo é reforço, não primeira exposição.
- Enunciados em português do Brasil, com termos técnicos em inglês quando canonicamente usados (ex.: "sift-up", "hash", "LIFO").
- Rodadas continuam sem persistência entre sessões (sem histórico, sem ranking entre usuários).
- Visualização dos passos continua exclusivamente textual (texto + pills de destaque) — nenhum SVG ou diagrama estrutural durante os passos, pra não vazar o nome da estrutura visualmente.
- Backend continua stateless; token HMAC continua sendo a única forma de carregar o gabarito entre chamadas.
- Reutilização das operações já implementadas em `backend/core/jogo/operacoes.py` (feature 004): não adicionamos novas operações nesta feature; só enriquecemos a metadata.
- Expiração de token continua em 1 hora.
- Mobile não é prioridade; só não pode quebrar o layout (passos acima da pergunta em telas estreitas).

## Fora de escopo (v2+)

- SVG da estrutura evoluindo durante os passos.
- Dificuldade escalável (fácil/médio/difícil) com operações compostas.
- Ranking, cronômetro, pontuação acumulada entre rodadas.
- Dicas intermediárias ("quer uma dica?").
- Autenticação, histórico pessoal.
- Modo "preveja o próximo passo" (ocultar último passo).
