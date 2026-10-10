# Contrato: POST /api/bst/comparar/

**Status**: evolução — adiciona `passos` cobrindo **inserção + busca**. Campos existentes (`arvore`, `passos` antigo renomeado, `comparacoes_bst`, `comparacoes_linear`) mantidos para compat.

> ⚠️ A chave `passos` do payload atual é a lista de comparações **da busca apenas**. Ela permanece com esse mesmo conteúdo pelo nome `passos_busca` (renomeada) para liberar o nome `passos` para o novo envelope step-by-step. Alternativa descartada: manter nome `passos` só pro novo envelope e migrar o frontend num único commit; preferimos quebra mínima.

## Request

```http
POST /api/bst/comparar/
Content-Type: application/json

{
  "valores": [50, 30, 70, 20, 40],
  "alvo": 40
}
```

Inalterado.

## Response — 200 OK

```json
{
  "arvore": { "valor": 50, "esq": { ... }, "dir": { ... } },
  "passos_busca": [
    { "no": 50, "comparacao": "menor" },
    { "no": 30, "comparacao": "maior" },
    { "no": 40, "comparacao": "igual" }
  ],
  "encontrado": true,
  "comparacoes_bst": 3,
  "comparacoes_linear": 3,
  "passos": [
    {
      "indice": 0,
      "descricao": "Árvore vazia. Inserindo 50 como raiz.",
      "destaques": ["no:50"],
      "estado": { "valor": 50, "esq": null, "dir": null }
    },
    {
      "indice": 1,
      "descricao": "Inserindo 30. Comparando com raiz 50 → 30 < 50, desce para a esquerda.",
      "destaques": ["no:50"],
      "estado": { "valor": 50, "esq": null, "dir": null }
    },
    {
      "indice": 2,
      "descricao": "Posição vazia à esquerda de 50. Inserindo 30 ali.",
      "destaques": ["no:30"],
      "estado": { "valor": 50, "esq": { "valor": 30, "esq": null, "dir": null }, "dir": null }
    }
    /* ... passos de inserção para 70, 20, 40; depois os passos da busca por 40 */
  ]
}
```

**Garantias**:

- `passos` cobre **toda** a operação: construção da árvore inserindo os valores na ordem + a busca pelo alvo. Dois subarranjos conceituais numa única lista linear.
- `destaques` usam `"no:<valor>"` onde `<valor>` é o campo `valor` do nó (único por inserção; a BST atual não aceita duplicatas).
- Último passo da busca tem `descricao` explícita sobre encontrado/não-encontrado.

## Response — 400 Bad Request

Formato existente, inalterado.
