# Contrato — `POST /api/jogo_adivinhe/palpite`

Valida um palpite em uma das 3 camadas (estrutura, operação, complexidade) e devolve veredito parcial + próxima pergunta ou sinal de fim.

> **Status frontend:** Endpoint ativo e testado no backend (15 testes passando), mas **não utilizado pelo frontend na versão final**. O frontend verifica client-side via os campos `indice_correto`/`explicacao_acerto`/`explicacao_erro` da resposta de `/rodada`. Mantido para compatibilidade e eventual uso futuro.

**Breaking change em relação à feature 004:** body ganha `estagio`; resposta muda formato.

---

## Request

```
POST /api/jogo_adivinhe/palpite
Content-Type: application/json
```

### Body

```json
{
  "token": "<base64url>.<base64url>",
  "estagio": "estrutura",
  "palpite": "Fila de prioridade implementada como monte binário"
}
```

### Campos

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `token` | string | sim | token recebido em `/rodada` ou em uma resposta anterior de `/palpite`. |
| `estagio` | `"estrutura" \| "operacao" \| "complexidade"` | sim | em qual camada o palpite se refere. |
| `palpite` | string | sim | texto exato de uma das 4 alternativas da pergunta correspondente. |

---

## Response — 200 OK (estágio não-final)

Quando `estagio ∈ {"estrutura", "operacao"}`:

```json
{
  "camada": "estrutura",
  "acertou": false,
  "correto": "Fila de prioridade implementada como monte binário",
  "explicacao": "A propriedade de monte binário (min-heap) garante pai ≤ filhos em todo o arranjo; a visita de reposicionamento após inserção é o sinal clássico. Uma árvore de busca balanceada manteria ordem lateral, não vertical.",
  "proxima_pergunta": {
    "camada": "operacao",
    "enunciado": "O procedimento demonstrado — comparar o elemento com seu pai e trocá-los enquanto a propriedade for violada, subindo até a raiz — é conhecido como:",
    "alternativas": [
      "HEAPIFY (ou BUILD-HEAP)",
      "SIFT-DOWN (ou PERCOLATE-DOWN)",
      "SIFT-UP (ou PERCOLATE-UP)",
      "EXTRACT-MIN"
    ]
  }
}
```

## Response — 200 OK (estágio final — complexidade)

Quando `estagio == "complexidade"`:

```json
{
  "camada": "complexidade",
  "acertou": true,
  "correto": "O(log n)",
  "explicacao": "A altura de um monte binário completo é ⌊log₂ n⌋; no pior caso o elemento sobe desde a folha até a raiz, logo o custo é Θ(log n). O(n log n) é o custo de construir o monte, não de inserir um elemento.",
  "proxima_pergunta": null
}
```

### Campos

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `camada` | `Camada` | ecoa o `estagio` da requisição. |
| `acertou` | boolean | `palpite == correto`. |
| `correto` | string | texto da alternativa correta da pergunta avaliada. |
| `explicacao` | string | texto acadêmico 2–3 linhas; pode variar conforme `acertou`. |
| `proxima_pergunta` | `PerguntaRevelada \| null` | `null` quando `estagio == "complexidade"`; caso contrário, pergunta pronta pro próximo estágio. |

---

## Invariantes

- A sequência correta é `estrutura → operacao → complexidade`. O backend **não** valida ordem (é stateless); o frontend força via máquina de estados.
- Para o mesmo token e mesmo `estagio`, chamar `/palpite` duas vezes é idempotente (mesma resposta — backend recomputa).
- `proxima_pergunta.alternativas` para o mesmo token tem ordem determinística (mesma seed).

---

## Erros

| Código | Causa | Body |
| --- | --- | --- |
| 400 | `estagio` fora do conjunto permitido. | `{"detail": "estagio inválido"}` |
| 400 | `palpite` não corresponde a nenhuma das 4 alternativas da pergunta esperada. | `{"detail": "palpite inválido"}` |
| 401 | Assinatura HMAC inválida. | `{"detail": "token inválido"}` |
| 404 | Token expirado (TTL excedido). | `{"detail": "rodada expirada"}` |

---

## Exemplo de uso (sessão completa)

```bash
# 1. carrega rodada
curl 'http://localhost:8000/api/jogo_adivinhe/rodada?seed=42' > rodada.json
TOKEN=$(jq -r .token rodada.json)

# 2. palpita estrutura
curl -X POST http://localhost:8000/api/jogo_adivinhe/palpite \
  -H 'Content-Type: application/json' \
  -d "{\"token\":\"$TOKEN\",\"estagio\":\"estrutura\",\"palpite\":\"Fila de prioridade implementada como monte binário\"}"

# 3. palpita operação (usando o mesmo token)
curl -X POST http://localhost:8000/api/jogo_adivinhe/palpite \
  -H 'Content-Type: application/json' \
  -d "{\"token\":\"$TOKEN\",\"estagio\":\"operacao\",\"palpite\":\"SIFT-UP (ou PERCOLATE-UP)\"}"

# 4. palpita complexidade — resposta final
curl -X POST http://localhost:8000/api/jogo_adivinhe/palpite \
  -H 'Content-Type: application/json' \
  -d "{\"token\":\"$TOKEN\",\"estagio\":\"complexidade\",\"palpite\":\"O(log n)\"}"
```
