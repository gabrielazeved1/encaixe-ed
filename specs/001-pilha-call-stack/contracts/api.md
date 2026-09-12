# API Contract: Pilha — Visualizador de Pilha de Chamadas

**Base path**: `/api/pilha/`
**Date**: 2026-09-12

---

## POST `/api/pilha/simular/`

Executa a simulação de uma função recursiva e retorna a sequência completa de
eventos da pilha de chamadas.

### Request

```json
{
  "funcao": "fatorial",
  "valor": 5
}
```

| Campo    | Tipo    | Obrigatório | Valores aceitos              |
| -------- | ------- | ----------- | ---------------------------- |
| `funcao` | string  | sim         | `"fatorial"`, `"fibonacci"`  |
| `valor`  | integer | sim         | inteiro ≥ 1                  |

### Response — 200 OK (simulação completa)

```json
{
  "funcao": "fatorial",
  "valor": 5,
  "status": "completo",
  "frames": [
    {
      "tipo": "push",
      "frame": {
        "nome_funcao": "fatorial",
        "argumento": 5,
        "retorno": null,
        "profundidade": 1
      },
      "pilha_estado": [
        { "nome_funcao": "fatorial", "argumento": 5, "retorno": null, "profundidade": 1 }
      ]
    },
    {
      "tipo": "push",
      "frame": {
        "nome_funcao": "fatorial",
        "argumento": 4,
        "retorno": null,
        "profundidade": 2
      },
      "pilha_estado": [
        { "nome_funcao": "fatorial", "argumento": 5, "retorno": null, "profundidade": 1 },
        { "nome_funcao": "fatorial", "argumento": 4, "retorno": null, "profundidade": 2 }
      ]
    },
    { "...": "... (frames de push para 3, 2, 1)" },
    {
      "tipo": "pop",
      "frame": {
        "nome_funcao": "fatorial",
        "argumento": 1,
        "retorno": 1,
        "profundidade": 5
      },
      "pilha_estado": [
        { "nome_funcao": "fatorial", "argumento": 5, "retorno": null, "profundidade": 1 },
        { "nome_funcao": "fatorial", "argumento": 4, "retorno": null, "profundidade": 2 },
        { "nome_funcao": "fatorial", "argumento": 3, "retorno": null, "profundidade": 3 },
        { "nome_funcao": "fatorial", "argumento": 2, "retorno": null, "profundidade": 4 }
      ]
    },
    { "...": "... (frames de pop para 2, 3, 4, 5)" }
  ]
}
```

### Response — 200 OK (overflow)

```json
{
  "funcao": "fibonacci",
  "valor": 100,
  "status": "overflow",
  "frames": [
    { "...": "... (eventos push até atingir MAX_DEPTH = 50)" },
    {
      "tipo": "overflow",
      "frame": {
        "nome_funcao": "fibonacci",
        "argumento": 51,
        "retorno": null,
        "profundidade": 51
      },
      "pilha_estado": [ { "...": "50 frames no topo" } ]
    }
  ]
}
```

### Response — 400 Bad Request (entrada inválida)

```json
{
  "erro": "Valor deve ser um inteiro positivo",
  "campo": "valor"
}
```

| Caso                        | `erro`                                    |
| --------------------------- | ----------------------------------------- |
| `funcao` fora dos valores   | `"Função inválida"`                       |
| `valor` ausente             | `"Campo obrigatório"`                     |
| `valor` não-inteiro         | `"Tipo inválido para o campo valor"`      |
| `valor` < 1                 | `"Valor deve ser um inteiro positivo"`    |

---

## Notas de contrato

- A resposta é sempre síncrona — não há polling.
- `pilha_estado` em cada evento reflete o estado **após** o evento ser aplicado.
- O array `frames` está **ordenado cronologicamente** (índice 0 = primeiro evento).
- `MAX_DEPTH = 50` é fixo no servidor; o cliente não pode configurá-lo.
- Não há autenticação, rate limiting ou versionamento de API na v1.
