# Contrato: POST /api/pilha/simular/

**Status**: evolução do contrato existente (feature 001) — adiciona `passos`; mantém `frames` para compat.

## Request

```http
POST /api/pilha/simular/
Content-Type: application/json

{
  "funcao": "fatorial" | "fibonacci",
  "valor": <int ≥ 1>
}
```

Validado por `PilhaSimularSerializer` (inalterado).

## Response — 200 OK

```json
{
  "funcao": "fatorial",
  "valor": 3,
  "status": "completo" | "overflow",
  "frames": [ /* ... legado, inalterado */ ],
  "passos": [
    {
      "indice": 0,
      "descricao": "Chamando fatorial(3). Empurrando frame na pilha.",
      "destaques": ["frame:3"],
      "estado": [
        { "nome_funcao": "fatorial", "argumento": 3, "retorno": null, "profundidade": 1 }
      ]
    },
    {
      "indice": 1,
      "descricao": "Chamando fatorial(2) recursivamente. Empurrando frame na pilha.",
      "destaques": ["frame:2"],
      "estado": [
        { "nome_funcao": "fatorial", "argumento": 3, "retorno": null, "profundidade": 1 },
        { "nome_funcao": "fatorial", "argumento": 2, "retorno": null, "profundidade": 2 }
      ]
    }
    /* ... mais passos até resolver tudo e esvaziar a pilha */
  ]
}
```

**Garantias**:

- `passos` nunca vazio. Mesmo `fatorial(1)` produz 2 passos (push + pop).
- `destaques` referenciam frames pelo campo `argumento` (ex.: `"frame:2"` destaca o frame onde `argumento == 2`).
- Em caso de `overflow`, o último passo tem `descricao` explicando o estouro de pilha e `destaques` apontando para o frame que não entrou.

## Response — 400 Bad Request

Mantém formato existente (erros do serializer). Nenhuma mudança.
