# Contract: POST /api/roteamento

**Status**: Compatível (adição em campo opcional).

## Request

Mesmo payload atual.

## Response (200 OK)

Mesmo shape JSON atual, com UMA diferença retrocompatível:

- O campo `passos` (array) agora pode conter **mais entradas** do que antes — passos de relaxamento de aresta são somados aos passos de finalização que já existiam.
- O frontend atual não lê `passos` do roteamento, então essa expansão é 100% retrocompatível.

### Shape de um passo de relaxamento

```json
{
  "indice": 3,
  "descricao": "Olhando aresta A→B (peso 4). Custo atual de B é null. Via A dá 7 → atualizo B para 7.",
  "destaques": ["no:A", "no:B", "aresta:A-B"],
  "estado": {
    "distancias": {"A": 3, "B": 7, "C": null},
    "visitados": ["A"]
  }
}
```

### Shape de um passo de finalização (inalterado)

Como está hoje.

## Alterações desta feature

- `backend/core/estruturas/graph.py`: expandir a função que roda Dijkstra para emitir um passo por aresta visitada dentro do loop interno. Snapshot de `distancias` inclui `null` para nós ainda não alcançados (serializando `float("inf")` como `null`).

## Compatibilidade

- Clientes que ignoram `passos` → sem impacto.
- Clientes que leem `passos` → recebem mais entradas; nenhum shape existente foi quebrado.

## Teste de aceitação

```bash
# Antes e depois: distâncias idênticas.
curl -X POST http://localhost:8000/api/roteamento \
  -H "Content-Type: application/json" \
  -d '{"origem": "A", "arestas": [...]}'
# → "distancias" idênticas; "passos" cresceu.
```

## Testes pytest

Novo teste em `test_graph.py` verifica:
1. Para grafo de referência (3 nós, 3 arestas), `len(passos)` cresceu em relação ao baseline.
2. Para o MESMO grafo, `distancias` finais são idênticas às calculadas antes da reescrita.
3. Cada passo de relaxamento tem a descrição no formato esperado e `destaques` incluem `no:` e `aresta:`.
