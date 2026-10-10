# Contract: `GET /api/jogo_adivinhe/rodada`

Sorteia e retorna uma nova rodada: `token` assinado + `passos` sem rótulo de estrutura.

---

## Request

**Method**: `GET`
**Path**: `/api/jogo_adivinhe/rodada`
**Query params**:

| Param | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `seed` | integer ≥ 0 | não | Se presente, torna a rodada reprodutível. Se ausente, backend sorteia uma seed interna. |

**Body**: nenhum.

### Exemplos

```bash
curl -X GET "http://localhost:8000/api/jogo_adivinhe/rodada"
curl -X GET "http://localhost:8000/api/jogo_adivinhe/rodada?seed=42"
```

---

## Response

### 200 OK

```json
{
  "token": "eyJlIjoicGlsaGEiLCJzIjo0MiwidCI6MTc2MjczNjgwMH0.aG1hY19iYXNlNjR...",
  "passos": [
    {
      "indice": 0,
      "descricao": "insiro 7 no topo",
      "destaques": ["topo"],
      "estado": {"elementos": [7]}
    },
    {
      "indice": 1,
      "descricao": "insiro 3 no topo",
      "destaques": ["topo"],
      "estado": {"elementos": [7, 3]}
    },
    {
      "indice": 2,
      "descricao": "removo elemento do topo",
      "destaques": ["topo"],
      "estado": {"elementos": [7]}
    }
  ]
}
```

### 400 Bad Request

Query param `seed` inválido (não-inteiro ou negativo).

```json
{"seed": ["seed deve ser um inteiro não-negativo"]}
```

### 500 Internal Server Error

Sorteador falhou em produzir uma rodada neutra em 10 tentativas (sinal de bug nas estruturas de `core/estruturas/`).

```json
{"detail": "não foi possível gerar rodada neutra em 10 tentativas"}
```

---

## Invariantes contratuais

1. `token` é sempre string de 2 segmentos separados por `.`, cada segmento base64url puro.
2. `passos` tem **pelo menos 2 elementos** (FR-005).
3. Nenhum campo em qualquer `passo` (`descricao`, `destaques[*]`, `estado` serializado) contém, case-insensitive, as substrings da [lista proibida](../research.md#d2--lista-proibida-e-varredura-de-neutralidade).
4. Mesma `seed` → mesma resposta bit-a-bit, independentemente do momento ou máquina.
5. Resposta sem `seed` pode variar entre chamadas (sorteio pseudoaleatório).

---

## Testes de contrato

- **test_rodada_tem_token_e_passos** (apps/jogo_adivinhe/tests.py): GET sem seed → status 200 e campos presentes.
- **test_rodada_seed_fixo_e_reprodutivel**: GET com `seed=42` duas vezes → payloads idênticos.
- **test_rodada_seed_invalido_retorna_400**: GET com `seed=-1` ou `seed=abc` → 400.
- **test_rodada_passos_minimo_2**: 20 rodadas aleatórias, todas com `len(passos) >= 2`.
- **test_rodada_sem_vazamento_de_nome**: 50 rodadas sorteadas; nenhum campo contém substrings proibidas.
