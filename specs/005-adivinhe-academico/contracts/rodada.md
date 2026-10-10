# Contrato — `GET /api/jogo_adivinhe/rodada`

Sorteia uma rodada (estrutura + operação + passos neutros) e devolve a primeira pergunta pronta.

**Mudança em relação à feature 004:** resposta ganha o campo `pergunta_estrutura`.

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
  "passos": [
    {
      "indice": 0,
      "descricao": "Estado inicial do arranjo: [2, 7, 5, 10]. A estrutura mantém uma propriedade de ordem parcial entre pais e filhos.",
      "destaques": ["indice:0", "indice:1", "indice:2", "indice:3"],
      "estado": {"data": [2, 7, 5, 10]}
    },
    "..."
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
| `token` | string | token HMAC stateless; carregado adiante em `/palpite`. Formato `<payload>.<assinatura>` em base64url. Claims: `{e, op, s, t}`. |
| `passos` | `Passo[]` | lista de passos neutros (sem nome da estrutura); shape herdado da feature 002. `len >= 2`. |
| `pergunta_estrutura` | `PerguntaRevelada` | pergunta de identificação da estrutura. |
| `pergunta_estrutura.camada` | `"estrutura"` | literal fixo. |
| `pergunta_estrutura.enunciado` | string | texto em português, NÃO pode conter nomes de estruturas (varredura obrigatória). |
| `pergunta_estrutura.alternativas` | `string[4]` | exatamente 4 itens; uma delas é a resposta correta. Ordem embaralhada deterministicamente pela seed. |

---

## Invariantes

- `varredura_neutra(passos)` passa: nenhuma substring das 7 estruturas aparece em `descricao`, `destaques` ou `json(estado)`.
- `varredura_neutra_texto(pergunta_estrutura.enunciado)` passa: nenhum nome das 7 estruturas no texto do enunciado.
- `len(pergunta_estrutura.alternativas) == 4`.
- Mesma `seed` → mesma `estrutura`, mesma `operacao`, mesmos `passos`, mesmo enunciado, mesma ordem de alternativas.

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
