# Contrato: POST /api/hash/comparar/

**Status**: evolução — adiciona `passos` cobrindo inserção (com colisões) + busca. Campos legados `linear` e `hash` mantidos.

## Request

```http
POST /api/hash/comparar/
Content-Type: application/json

{
  "dados": [
    { "chave": "ana", "valor": 1 },
    { "chave": "bia", "valor": 2 },
    { "chave": "zoe", "valor": 3 }
  ],
  "chave": "bia"
}
```

Inalterado.

## Response — 200 OK

```json
{
  "linear": { "comparacoes": 2, "encontrado": true },
  "hash": { "comparacoes": 2, "encontrado": true, "indice": 5 },
  "passos": [
    {
      "indice": 0,
      "descricao": "Tabela vazia (16 buckets). Pronta para receber inserções.",
      "destaques": [],
      "estado": { "tamanho": 16, "buckets": [[], [], ... ] }
    },
    {
      "indice": 1,
      "descricao": "Inserindo \"ana\" → h(\"ana\") = 3. Bucket 3 está vazio.",
      "destaques": ["bucket:3"],
      "estado": { "tamanho": 16, "buckets": [ /* ana no bucket 3 */ ] }
    },
    {
      "indice": 2,
      "descricao": "Inserindo \"bia\" → h(\"bia\") = 5. Bucket 5 está vazio.",
      "destaques": ["bucket:5"],
      "estado": { "...": "bia no bucket 5" }
    },
    {
      "indice": 3,
      "descricao": "Inserindo \"zoe\" → h(\"zoe\") = 5. Colisão: bucket 5 já tem \"bia\". Adicionando ao final da lista.",
      "destaques": ["bucket:5"],
      "estado": { "...": "bucket 5 agora tem [(bia,2),(zoe,3)]" }
    },
    {
      "indice": 4,
      "descricao": "Buscando \"bia\" → h(\"bia\") = 5. Comparando com primeiro item do bucket 5.",
      "destaques": ["bucket:5"],
      "estado": { "...": "estado inalterado" }
    },
    {
      "indice": 5,
      "descricao": "Chave encontrada: \"bia\" (2 comparações).",
      "destaques": ["bucket:5"],
      "estado": { "...": "estado final" }
    }
  ]
}
```

**Garantias**:

- Primeiro passo sempre descreve a tabela vazia (estado inicial), mesmo que `dados` esteja vazia (edge case: nessa situação só esse passo + o passo da busca que não encontra).
- Colisões geram descrição explícita contendo "Colisão" (asserção testável).
- `destaques` usam `"bucket:<indice>"`.
- `estado.buckets` é sempre uma lista de tamanho `estado.tamanho` (16 por default).

## Response — 400 Bad Request

Formato existente, inalterado.
