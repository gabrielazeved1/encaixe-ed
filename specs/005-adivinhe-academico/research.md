# Research — Jogo Adivinhe Modo Acadêmico

Decisões arquiteturais tomadas antes de implementar. Cada entrada: contexto → opções → decisão → por quê.

---

## D1 — Breaking change em `/palpite`

**Contexto.** A feature 004 expõe `POST /api/jogo_adivinhe/palpite` com body `{token, palpite}` e resposta `{acertou, estrutura_correta, explicacao}`. A nova feature exige `estagio` e devolve `proxima_pergunta` ou `veredito_final`.

**Opções.**
- A — manter o endpoint antigo e criar `/palpite/v2`.
- B — breaking change assumido; frontend muda na mesma feature.

**Decisão.** B. Único consumidor é o próprio frontend do Encaixe; a feature 004 só existe em dev. Zero valor em manter compat.

**Alternativas descartadas.** Rota paralela aumentaria superfície de testes e abriria caminho pra código morto.

---

## D2 — Onde montar o veredito final

**Contexto.** Após o 3º palpite, usuário vê 3 cards + pontuação total. Essa composição pode acontecer no backend (uma resposta rica com os 3 vereditos) ou no frontend (cada palpite devolve só sua camada, cliente acumula).

**Opções.**
- A — backend monta: no 3º palpite, body inclui `palpites_anteriores`; backend devolve `veredito_final` completo.
- B — frontend acumula: cada palpite devolve só sua camada; cliente monta a tela.

**Decisão.** B. Mantém backend stateless (cada chamada só decode o token, valida um palpite, devolve explicação da camada). Simplifica `/palpite` (sem campos opcionais aninhados). Pontuação é soma trivial no frontend.

**Alternativas descartadas.** A implica estado no corpo da requisição (frontend repassa os palpites anteriores), o que é propenso a inconsistência (token válido + palpites_anteriores mentirosos → backend confia cegamente ou re-valida). Mais complexidade sem ganho.

---

## D3 — Determinismo e embaralhamento das alternativas

**Contexto.** FR-018 exige reprodutibilidade por seed: mesma seed → mesma rodada bit-a-bit, incluindo ordem das 4 alternativas na pergunta.

**Opções.**
- A — alternativas sempre na ordem fixa cadastrada no banco.
- B — embaralhar com `random.Random(seed)` instanciado uma vez na rodada e passado adiante.

**Decisão.** B. Embaralhar evita que o aluno decore "resposta sempre é a B" em rodadas repetidas. A seed garante reprodutibilidade. O `random.Random` já existe no sortear.

**Como funciona.** `montar_pergunta(estrutura, operacao, camada, rng)` sorteia um dos enunciados do banco, embaralha a lista de alternativas com `rng.shuffle()`, atualiza `indice_correto` pra bater com a nova posição.

**Comparação no backend.** `avaliar(..., palpite)` compara `palpite` (string) contra o texto da alternativa correta — nunca contra índice. Isso é possível porque a resposta correta é regenerada deterministicamente a partir de `(seed, estrutura, operacao, camada)`: o backend reconstrói o `rng` e chama `montar_pergunta` novamente, pegando a alternativa correta. Trade: `/palpite` precisa chamar `montar_pergunta` igual ao `/rodada` (mesmo custo).

---

## D4 — Enunciado completo na response ou só ID

**Contexto.** Perguntas vêm do banco do backend. Frontend pode receber (a) enunciado+alternativas inteiros, ou (b) só um ID e consultar um banco local idêntico.

**Opções.**
- A — enunciado+alternativas completos na response.
- B — ID + banco espelhado no frontend.

**Decisão.** A. Backend é a fonte da verdade; frontend ignora o conteúdo e só renderiza. Qualquer ajuste de texto fica num só lugar.

**Alternativas descartadas.** B duplica o banco e abre risco de divergência entre backend e frontend em correções linguísticas.

---

## D5 — Explicações por acertou/errou

**Contexto.** FR-005 pede explicação acadêmica no veredito. A spec sugere que o texto pode variar conforme o aluno acertou ou errou (ex.: quando erra, cita o distrator comum).

**Opções.**
- A — mesma string pra os 2 casos; diferencial é só visual (verde vs âmbar).
- B — 2 strings separadas por (estrutura, camada): `{acertou: ..., errou: ...}`.

**Decisão.** B — modelar o campo mesmo que v1 use strings idênticas. Permite enriquecer sem mudança de contrato.

**Formato.** `EXPLICACOES: dict[tuple[Estrutura, Camada], dict[Literal["acertou", "errou"], str]]`.

---

## D6 — Validação de `op` no token

**Contexto.** Claims passam de `{e, s, t}` para `{e, op, s, t}`. Tokens antigos (sem `op`) viram inválidos.

**Opções.**
- A — aceitar tokens sem `op` e tratar como camada única (compat).
- B — rejeitar com `TokenInvalido`.

**Decisão.** B. Zero tokens em produção; o breaking já foi assumido em D1.

**Como funciona.** `token.decode()` passa a checar: `claims.keys() == {"e", "op", "s", "t"}`, `claims["op"]` ∈ set de operações válidas da `e` (via `OPERACOES[claims["e"]]`). Mantém o mesmo padrão de `e in ESTRUTURAS_VALIDAS` que já existe.

---

## D7 — `complexidade.py` separado de `operacoes.py`

**Contexto.** A tabela de lookup `(estrutura, operacao) -> string` pode viver dentro de `operacoes.py` (metadata direto na dataclass) ou num módulo próprio.

**Opções.**
- A — `complexidade_pior` como atributo de `OperacaoJogavel`.
- B — módulo `complexidade.py` com dict independente.

**Decisão.** B. Isola a responsabilidade (lookup conceitual, não "o que a operação faz"). Facilita testar que o banco de alternativas da camada "complexidade" é consistente com o lookup. Facilita também evoluir pra "complexidade média" / "espaço" / "amortizada" sem inchar `OperacaoJogavel`.

Nota: o atributo `complexidade_pior` em `OperacaoJogavel` ainda será adicionado (serve como fonte canônica consultada pelo módulo `complexidade.py`), mas o acesso programático passa por `complexidade.pior_caso(estrutura, operacao)`.

---

## D8 — Ordem de implementação (reflete-se no tasks.md)

**Decisão.**
1. Spec/plan/research/data-model/contratos/quickstart (este commit).
2. Camada pura, testes primeiro:
   - `operacoes.py` metadata estendida + test.
   - `complexidade.py` + test.
   - `perguntas.py` + test (incluindo varredura de neutralidade de enunciados).
   - `explicacoes.py` extendido + test.
3. `token.py` atualizado (claims com `op`) + test.
4. `sortear.py` atualizado (retorna 1a pergunta) + test.
5. `avaliar.py` atualizado (estagio, veredito parcial + explicação) + test.
6. Endpoint `/rodada` atualizado + testes de contrato.
7. Endpoint `/palpite` atualizado + testes de contrato.
8. Frontend: componentes novos sem rota (`PerguntaAcademica`, `ProgressoRodada`, `VereditoFinal`).
9. Frontend: hook de atalhos.
10. Frontend: `useAdivinheRodada` reescrito + `AdivinheClient` reescrito.
11. Validação manual + ajustes finos.

Esta ordem respeita Constituição IV e mantém baseline sempre verde entre commits de backend.

---

## D9 — Atalhos de teclado em hook separado

**Contexto.** O jogo precisa aceitar `1-4`, `Enter`, `←`, `→`, `espaço`. Pode ir dentro do `AdivinheClient` (handlers inline) ou num hook (`useAtalhosRodada`).

**Opções.**
- A — `useEffect` + listener no próprio `AdivinheClient`.
- B — hook customizado `useAtalhosRodada({ onNumero, onEnter, onEsquerda, onDireita })`.

**Decisão.** B. Isolar a lógica de teclado em um hook facilita (a) testar com vitest (dispatchar `KeyboardEvent` e verificar callback invocado), (b) respeitar foco em input/textarea (lógica centralizada), (c) reaproveitar se outra tela usar o mesmo padrão.

---

## D10 — Veredito final: layout e progressão

**Contexto.** Como transicionar entre "respondendo" e "veredito"?

**Decisão.**
- Durante os 3 estágios: layout 2 colunas (passos | pergunta).
- No veredito: colapsa para 1 coluna cheia com 3 cards (`estrutura`, `operação`, `complexidade`) em grid responsivo. Passos ficam escondidos (já viram o que importava).
- Transição: `opacity` + `translateY` leve, duração 200-300ms via Tailwind (`transition-all duration-300`).

Decisão suporta FR-011, FR-015, FR-016.

---

## D11 — Preservar `Veredito.tsx` ou deletar

**Decisão.** Deletar. Mantê-lo como legado só gera dead code. `VereditoFinal.tsx` substitui integralmente.

---

## Resumo das decisões

| ID | Decisão | Impacto |
| --- | --- | --- |
| D1 | Breaking change em `/palpite` | Simplifica superfície |
| D2 | Frontend acumula veredito | Backend 100% stateless |
| D3 | Embaralhar alternativas com `rng` | Reprodutibilidade preservada |
| D4 | Enunciado completo na response | Backend é fonte da verdade |
| D5 | Explicações `{acertou, errou}` | Permite enriquecer sem breaking |
| D6 | Rejeitar tokens antigos | Força upgrade frontend |
| D7 | `complexidade.py` separado | Separação de responsabilidades |
| D8 | Ordem incremental (teste → impl → endpoint) | Constituição IV |
| D9 | Hook `useAtalhosRodada` | Testável e isolado |
| D10 | Transição 2 colunas → 1 coluna | UX acadêmica |
| D11 | Deletar `Veredito.tsx` | Zero código morto |
