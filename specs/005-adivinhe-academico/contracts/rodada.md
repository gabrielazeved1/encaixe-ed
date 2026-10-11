# Contrato — `GET /api/jogo_adivinhe/rodada`

Sorteia uma rodada (estrutura + operação + passos neutros) e devolve as 3 perguntas completas com gabarito para verificação client-side.

**Mudança em relação à feature 004:** resposta ganha o campo `pergunta_estrutura`.

> **Atualização feature 005 (final):** resposta ganha também `estrutura` (nome da estrutura sorteada, usado para despacho do SVG no `AdivinheVisual.tsx`) e `perguntas` (array com as 3 perguntas completas com gabarito e explicações, usadas para verificação client-side). O campo `pergunta_estrutura` original foi mantido por compatibilidade mas `perguntas` é o campo canônico do design final.

---

## Request

```
GET /api/jogo_adivinhe/rodada[?seed=42]
```

### Query parameters

| Nome | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `seed` | inteiro ≥ 0 | não | semente para reprodutibilidade determinística; se ausente, backend sorteia 32 bits. |

### Headers

Nenhum obrigatório.

---

## Response — 200 OK

```json
{
  "token": "<base64url(json({e, op, s, t}))>.<base64url(hmac_sha256)>",
  "estrutura": "heap",
  "passos": [
    {
      "indice": 0,
      "descricao": "Estado inicial do arranjo: [2, 7, 5, 10]. A estrutura mantém uma propriedade de ordem parcial entre pais e filhos.",
      "destaques": ["indice:0", "indice:1", "indice:2", "indice:3"],
      "estado": {"data": [2, 7, 5, 10]}
    },
    "..."
  ],
  "perguntas": [
    {
      "camada": "estrutura",
      "enunciado": "A sequência de reposicionamentos ascendentes, mantendo uma relação de ordem parcial pai-filho ao longo de um arranjo representado como árvore binária implícita, é característica de qual estrutura?",
      "alternativas": [
        "Árvore binária de busca balanceada",
        "Fila de prioridade implementada como monte binário",
        "Lista duplamente encadeada ordenada",
        "Tabela de dispersão com encadeamento"
      ],
      "indice_correto": 1,
      "explicacao_acerto": "Exato. O monte binário mantém a propriedade de ordem parcial pai ≤ filhos; o sift-up após inserção é a operação vista nos passos.",
      "explicacao_erro": "Incorreto. A propriedade de monte binário (min-heap) garante pai ≤ filhos em todo o arranjo; a visita de reposicionamento após inserção é o sinal clássico. Uma árvore de busca balanceada manteria ordem lateral, não vertical."
    },
    {
      "camada": "operacao",
      "enunciado": "O procedimento demonstrado — comparar o elemento com seu pai e trocá-los enquanto a propriedade for violada, subindo até a raiz — é conhecido como:",
      "alternativas": [
        "HEAPIFY (ou BUILD-HEAP)",
        "SIFT-DOWN (ou PERCOLATE-DOWN)",
        "SIFT-UP (ou PERCOLATE-UP)",
        "EXTRACT-MIN"
      ],
      "indice_correto": 2,
      "explicacao_acerto": "Correto. SIFT-UP sobe o elemento recém-inserido na folha até restaurar a propriedade de heap.",
      "explicacao_erro": "Incorreto. SIFT-DOWN move o elemento para baixo; BUILD-HEAP constrói o monte completo; EXTRACT-MIN remove a raiz. O movimento ascendente folha→raiz é exclusivo do SIFT-UP."
    },
    {
      "camada": "complexidade",
      "enunciado": "Qual é a complexidade de pior caso da operação demonstrada em um monte binário com n elementos?",
      "alternativas": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      "indice_correto": 1,
      "explicacao_acerto": "Correto. A altura de um monte binário completo é ⌊log₂ n⌋; no pior caso o elemento sobe desde a folha até a raiz.",
      "explicacao_erro": "Incorreto. A altura de um monte binário completo é ⌊log₂ n⌋; no pior caso o elemento sobe desde a folha até a raiz, logo o custo é Θ(log n). O(n log n) é o custo de construir o monte, não de inserir um elemento."
    }
  ],
  "pergunta_estrutura": {
    "camada": "estrutura",
    "enunciado": "A sequência de reposicionamentos ascendentes, mantendo uma relação de ordem parcial pai-filho ao longo de um arranjo representado como árvore binária implícita, é característica de qual estrutura?",
    "alternativas": [
      "Árvore binária de busca balanceada",
      "Fila de prioridade implementada como monte binário",
      "Lista duplamente encadeada ordenada",
      "Tabela de dispersão com encadeamento"
    ]
  }
}
```

### Campos

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `token` | string | token HMAC stateless; carregado adiante em `/palpite` se necessário. Formato `<payload>.<assinatura>` em base64url. Claims: `{e, op, s, t}`. |
| `estrutura` | string | nome da estrutura sorteada (ex.: `"heap"`, `"pilha"`). Usado pelo `AdivinheVisual.tsx` para despachar o renderer SVG correto. |
| `passos` | `Passo[]` | lista de passos neutros (sem nome da estrutura); shape herdado da feature 002. `len >= 2`. |
| `perguntas` | `PerguntaCompleta[3]` | array com exatamente 3 perguntas na ordem `[estrutura, operacao, complexidade]`, cada uma com gabarito e explicações incluídos. |
| `perguntas[].camada` | `Camada` | `"estrutura"`, `"operacao"` ou `"complexidade"`. |
| `perguntas[].enunciado` | string | texto em português; para camada `"estrutura"`, NÃO pode conter nomes de estruturas (varredura obrigatória). |
| `perguntas[].alternativas` | `string[4]` | exatamente 4 itens. Ordem embaralhada deterministicamente pela seed. |
| `perguntas[].indice_correto` | `0\|1\|2\|3` | índice da alternativa correta no array `alternativas`. Incluído para verificação client-side. |
| `perguntas[].explicacao_acerto` | string | texto acadêmico 2–3 linhas exibido quando o aluno acerta. |
| `perguntas[].explicacao_erro` | string | texto acadêmico 2–3 linhas exibido quando o aluno erra, comentando o distrator. |
| `pergunta_estrutura` | `PerguntaRevelada` | campo legado da feature 005 inicial (mantido por compatibilidade); equivale a `perguntas[0]` sem `indice_correto` e explicações. |

---

## Invariantes

- `varredura_neutra(passos)` passa: nenhuma substring das 7 estruturas aparece em `descricao`, `destaques` ou `json(estado)`.
- `varredura_neutra_texto(perguntas[0].enunciado)` passa: nenhum nome das 7 estruturas no texto do enunciado de camada `"estrutura"`.
- `len(perguntas) == 3` e `len(perguntas[i].alternativas) == 4` para `i ∈ {0, 1, 2}`.
- `0 <= perguntas[i].indice_correto < 4` para todo `i` — gabarito sempre válido.
- `perguntas` são **completas**: incluem `indice_correto`, `explicacao_acerto` e `explicacao_erro`. O frontend usa esses campos para verificação client-side sem precisar chamar `/palpite`.
- Mesma `seed` → mesma `estrutura`, mesma `operacao`, mesmos `passos`, mesmo enunciado, mesma ordem de alternativas, mesmos `indice_correto`.

---

## Erros

| Código | Causa | Body |
| --- | --- | --- |
| 400 | `seed` fornecido mas inválido (não-dígitos, negativo). | `{"detail": "seed inválido"}` |
| 500 | Falha interna de geração (ex.: 10 tentativas de rodada neutra esgotadas). | `{"detail": "erro ao gerar rodada"}` |

---

## Exemplo de uso

```bash
curl 'http://localhost:8000/api/jogo_adivinhe/rodada?seed=42'
```
