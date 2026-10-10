# Research: Jogo "Adivinhe a Estrutura"

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Data**: 2026-10-10

As decisões abaixo resolvem todos os pontos "NEEDS CLARIFICATION" implícitos no plano. Nenhuma dependência externa nova.

---

## D1 — Persistência da rodada: token HMAC stateless

**Decisão**: a resposta correta da rodada viaja no próprio token, assinado com HMAC-SHA256 usando `settings.SECRET_KEY` do Django. Formato: `base64url(json(claims)) + "." + base64url(hmac_sha256(payload))`. Claims: `{"e": estrutura, "s": seed, "t": timestamp_emissao}`. Validação no veredito: recomputa HMAC, confere assinatura, confere `now - t < TTL`.

**Rationale**:

- Respeita literalmente "cada chamada stateless" da constituição (Restrições de Infraestrutura).
- Zero vazamento de memória sob longa execução.
- Trivialmente escalável para multi-process no Render sem compartilhar storage.
- Expiração implícita por timestamp, sem job de limpeza.
- Reutiliza `SECRET_KEY` existente — nenhum secret novo para gerenciar.

**Alternativas consideradas**:

- Dict de módulo em memória + TTL manual: funciona, mas acumula lixo até o TTL varrer; morre no restart; não escala para multi-process. Rejeitado.
- Django cache framework: adiciona dependência indireta de backend de cache (local-memory no dev, mas Render precisa Redis para produção decente). Rejeitado para v1.
- Cookie assinado: viável, mas limita a 1 rodada ativa por navegador — torna "próxima rodada enquanto a anterior ainda não respondeu" quebrado. Rejeitado.

**Riscos conhecidos**: `SECRET_KEY` precisa estar presente em produção (já é requisito do Django). Rotação de chave invalida rodadas em voo — aceitável.

---

## D2 — Lista proibida e varredura de neutralidade

**Decisão**: a função `varredura_neutra(passos)` em `core/jogo/neutralidade.py` recebe a lista de passos pronta e grepa (case-insensitive, com `\b`) pelas seguintes substrings na concatenação de `descricao` + `destaques` + `estado` serializado como JSON:

```python
PROIBIDAS = {
    "pilha", "stack",
    "fila", "queue",
    "heap", "monte",
    "hash", "tabela hash",
    "bst", "árvore binária", "arvore binaria",
    "linkedlist", "linked list", "lista encadeada",
    "grafo", "graph",
    "dijkstra", "bfs",   # revelariam o grafo
}
```

Se qualquer match for encontrado, `sortear()` re-sorteia (máximo 10 tentativas; na 11ª levanta `RuntimeError`, que o endpoint traduz em 500).

**Rationale**:

- Mais defensivo que uma whitelist (impossível enumerar tudo que o backend pode gerar).
- Palavras técnicas específicas ("sift", "bucket") ficam fora da lista — ELAS são o fingerprint do jogo.
- "Dijkstra" e "BFS" entram porque bastam para denunciar o Grafo mesmo sem o nome "grafo".

**Alternativas consideradas**:

- Reescrever as descrições das estruturas: alto custo e já foi feito parcialmente na feature 003 (termos neutros nos passos de Dijkstra, Pilha, etc.). Varredura é a defesa adicional, não a primária.
- Regex mais sofisticada (ex.: `pilha?`, radical "fil"): falsos positivos indesejados. Rejeitado em favor de lista exata.

**Teste**: `test_neutralidade.py` sorteia 100 rodadas com seeds `range(100)` e verifica que todas passam a varredura.

---

## D3 — Operações jogáveis por estrutura

**Decisão**: `core/jogo/operacoes.py` define, por estrutura, uma lista de operações atômicas e seus parâmetros aleatórios. Cada chamada do sorteador escolhe uma operação da lista com `random.choice`. Após execução, a operação precisa produzir ≥ 2 passos observáveis (SC/FR-005); se produzir menos, é descartada e re-sorteia.

**Fingerprints acordados** (de ponto 7 do briefing do usuário):

| Estrutura | Operação jogável | Fingerprint da mecânica |
|---|---|---|
| Pilha | push de 3 valores + pop | destaque `topo`; ordem LIFO visível no pop |
| Fila | enqueue de 3 valores + dequeue | destaques `inicio` e `fim`; ordem FIFO |
| Heap | push de 4–5 valores com sift-up visível **ou** pop com sift-down | trocas pai↔filho sucessivas |
| Hash | inserir 3–4 chaves com colisão forçada no mesmo bucket + buscar uma | destaques `bucket:N`, probing linear |
| BST | inserir 4–5 valores + buscar um | destaques direcionais `esq` / `dir` ou "nó com valor X comparo com Y" |
| LinkedList | sequência `push` + `insert_at(pos)` + `remove_at(pos)` | destaques `pos:N`, percurso linear visível |
| Grafo | Dijkstra em grafo de 4 nós (A–B–C–D com arestas) | destaques `aresta:X-Y`, relaxamentos da feature 003 |

**Rationale**: cada fingerprint é **inconfundível** com os outros 6 — a varredura cega da feature 003 garante isso para Dijkstra; os demais usam termos já neutros nas implementações atuais.

**Alternativas consideradas**:

- Permitir qualquer operação pública da estrutura: aumenta risco de rodada ambígua (ex.: push isolado em Pilha vs Fila). Rejeitado em favor da lista curada acima.
- Múltiplas operações por rodada: fora de escopo v1 (spec).

**Risco pendente**: colisão forçada no Hash exige valores pré-computados ou tentativa-e-erro. `sortear.py` pré-calcula 3 chaves inteiras que caem no mesmo bucket para a `HashTable` concreta (função determinística + capacidade conhecida), aceitando tentativa-e-erro no sorteio quando a seed não produz colisão trivial.

---

## D4 — Semente e reprodutibilidade

**Decisão**: `sortear(seed: int | None) -> Rodada`:

- Se `seed is None`: usa `secrets.randbits(32)` como seed concreta e inclui no token para rastreabilidade.
- Se `seed` fornecida: usa `random.Random(seed)` como gerador local (NÃO toca em `random` global).

**Rationale**:

- SC-005 exige que `?seed=42` seja reprodutível entre máquinas; só isolar o `Random` local garante isso.
- Timestamp do token é independente da seed — a mesma seed em horas diferentes produz o mesmo CONTEÚDO, mas tokens distintos (expiração funciona).

**Alternativas consideradas**:

- Usar `random.seed(seed)` global: contamina outras partes do backend. Rejeitado.
- Seeds textuais hashadas: desnecessário; inteiros já cumprem.

---

## D5 — Visualização neutra no frontend

**Decisão**: criar `PassosGenericoVisual.tsx` em `components/jogo/`. Para cada passo, renderiza:

1. Caixa de descrição (texto plano).
2. Linha de pills para `destaques` (ex.: pill com fundo acentuado para `topo`, `bucket:3`, `aresta:A-B`).
3. Painel de "estado atual" renderizado como **texto JSON pretty-printed** ou lista `chave: valor` — sem SVG, sem grid, sem círculos ligados por linhas.

Reusa `StepControls` e `StepNarrator` da feature 002 sem modificação.

**Rationale**:

- Diagramas específicos (nós ligados, bars, grid de hash) vazam a estrutura por desenho. Texto não vaza.
- Pills de destaques preservam o fingerprint textual que é o ponto pedagógico do jogo.
- Mantém a feature isolada: nenhum componente existente precisa ser modificado.

**Alternativas consideradas**:

- Esconder apenas o label do diagrama existente: o diagrama em si (ex.: nós com setas) revela "grafo". Rejeitado.
- Blur dinâmico sobre diagramas: hack visual, não resolve acessibilidade. Rejeitado.

---

## D6 — Explicações pedagógicas no veredito

**Decisão**: dict estático `EXPLICACOES: dict[str, str]` em `core/jogo/explicacoes.py`, uma entrada por estrutura, com texto de 1–2 frases explicando o fingerprint típico. Exemplos:

```python
EXPLICACOES = {
    "pilha": "A mecânica LIFO (último a entrar, primeiro a sair) é visível porque "
             "cada inserção e cada remoção acontecem sempre no 'topo' — nenhum "
             "outro ponto da estrutura é tocado.",
    "fila": "FIFO: inserção acontece no 'fim' e remoção no 'início'. Dois ponteiros "
            "em pontas opostas são a assinatura.",
    "heap": "As trocas sucessivas entre pai e filho (sift) são o fingerprint. Isso "
            "só aparece em estrutura que mantém invariante de ordem parcial.",
    "hash": "O destaque 'bucket:N' e o probing linear quando há colisão só aparecem "
            "em tabela de dispersão — nenhuma outra estrutura usa buckets.",
    "bst": "Comparações 'maior → direita, menor → esquerda' em cada nó são a mecânica "
           "da busca binária em árvore. É a única que ramifica desse jeito.",
    "linkedlist": "O percurso linear até uma 'pos:N' antes de inserir ou remover é o "
                  "custo clássico de lista encadeada: sem acesso aleatório, só sequencial.",
    "grafo": "Passos de relaxamento 'aresta:X-Y → atualizo/mantenho' só aparecem em "
             "Dijkstra, que opera sobre grafos.",
}
```

**Rationale**:

- Teste educacional, não teste técnico — o aluno precisa de uma frase, não de um ensaio.
- Estático = testável: um teste verifica que todas as 7 chaves existem e que o texto não contém `[NEEDS CLARIFICATION]` ou TODOs.

**Alternativas consideradas**:

- Buscar explicações em `frontend/content/projetos.ts`: viola Core-First (backend consumiria dado do frontend). Rejeitado.
- Gerar explicação dinâmica a partir dos destaques do passo que denunciou: criativo mas frágil e difícil de testar. Rejeitado para v1.

---

## D7 — Formato dos endpoints

**Decisão**:

### `GET /api/jogo_adivinhe/rodada`

Query params:
- `seed` (opcional): inteiro.

Response 200:
```json
{
  "token": "eyJlIjoicGlsaGEi...xJQb",
  "passos": [
    {"indice": 0, "descricao": "insiro 7 no topo", "destaques": ["topo"], "estado": {...}},
    {"indice": 1, "descricao": "insiro 3 no topo", "destaques": ["topo"], "estado": {...}}
  ]
}
```

### `POST /api/jogo_adivinhe/palpite`

Body:
```json
{"token": "eyJlI...", "palpite": "heap"}
```

Response 200:
```json
{
  "acertou": true,
  "estrutura_correta": "heap",
  "explicacao": "As trocas sucessivas entre pai e filho (sift) são o fingerprint..."
}
```

Erros:
- 400: palpite não é uma das 7 estruturas conhecidas, ou corpo inválido.
- 404: token válido mas timestamp expirado.
- 401: token com assinatura adulterada.

**Rationale**: GET para rodada (idempotente para a mesma seed) e POST para palpite (ação com corpo). Nomes de erro HTTP consistentes com o padrão do site.

---

## D8 — Ordem de implementação

**Decisão** (menor risco primeiro, respeitando Constituição IV):

1. Setup backend: criar `core/jogo/__init__.py`, pacote `tests/`.
2. **Token** (`token.py` + `test_token.py`): isolado, trivial de testar com HMAC determinístico.
3. **Operações + Sorteador** (`operacoes.py`, `sortear.py` + testes): depende das estruturas existentes (sem alterações).
4. **Neutralidade** (`neutralidade.py` + `test_neutralidade.py`): grep nas 100 rodadas sorteadas.
5. **Explicações + Avaliar** (`explicacoes.py`, `avaliar.py` + testes): depende de token + lookup.
6. **Endpoint `/rodada`**: view magra chamando `sortear` + `varredura_neutra`.
7. **Endpoint `/palpite`**: view magra chamando `avaliar`.
8. **Frontend US1**: rota `/adivinhe`, `useAdivinheRodada`, `PassosGenericoVisual`, `BotoesPalpite`, `Veredito`.
9. **US2**: botão "Próxima" (reaproveita `useAdivinheRodada`).
10. **US3**: seed via querystring.
11. **US4**: link na home.

**Rationale**: cada camada tem seus testes verdes antes da próxima começar; qualquer falha isolada é diagnosticada no nível mais baixo possível.

---

Nenhum NEEDS CLARIFICATION remanescente. O Technical Context está completo.
