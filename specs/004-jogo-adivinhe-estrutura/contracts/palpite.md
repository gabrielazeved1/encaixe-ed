# Contract: `POST /api/jogo_adivinhe/palpite`

Recebe o `token` emitido por `/rodada` e o `palpite` do jogador; devolve veredito.

---

## Request

**Method**: `POST`
**Path**: `/api/jogo_adivinhe/palpite`
**Content-Type**: `application/json`

**Body**:

```json
{
  "token": "<string emitida por GET /rodada>",
  "palpite": "pilha" | "fila" | "heap" | "hash" | "bst" | "linkedlist" | "grafo"
}
```

### Exemplo

```bash
curl -X POST "http://localhost:8000/api/jogo_adivinhe/palpite" \
  -H "Content-Type: application/json" \
  -d '{"token": "eyJ…", "palpite": "pilha"}'
```

---

## Response

### 200 OK

```json
{
  "acertou": true,
  "estrutura_correta": "pilha",
  "explicacao": "A mecânica LIFO (último a entrar, primeiro a sair) é visível porque cada inserção e cada remoção acontecem sempre no 'topo' — nenhum outro ponto da estrutura é tocado."
}
```

Mesmo quando `acertou == false`, os três campos são preenchidos (o aluno recebe sempre a resposta correta + a explicação).

### 400 Bad Request

Corpo malformado ou `palpite` fora das 7 estruturas conhecidas.

```json
{"palpite": ["palpite deve ser uma das 7 estruturas: pilha, fila, heap, hash, bst, linkedlist, grafo"]}
```

### 401 Unauthorized

Token com assinatura adulterada ou formato inválido.

```json
{"detail": "token inválido"}
```

### 404 Not Found

Token bem-formado e assinado, mas timestamp fora da janela (`now - t >= TTL_SEGUNDOS`).

```json
{"detail": "rodada expirada"}
```

---

## Invariantes contratuais

1. Resposta é **idempotente**: múltiplos palpites com o mesmo `token` + mesmo `palpite` devolvem a mesma resposta (FR-009).
2. `estrutura_correta` sempre bate com `claims.e` do token decodificado.
3. `explicacao` nunca é vazia (teste em `test_explicacoes.py` garante que todas as 7 chaves existem com texto não-vazio).
4. Resposta nunca inclui `claims.s` ou `claims.t` do token — essas são informações internas.
5. Erros 401 e 404 **não** vazam o conteúdo do token (resposta genérica).

---

## Testes de contrato

- **test_palpite_acerto_retorna_acertou_true** (apps/jogo_adivinhe/tests.py): fluxo end-to-end — pegar rodada, decodificar manualmente para saber `e`, palpitar `e`, esperar `acertou=true`.
- **test_palpite_erro_retorna_acertou_false_mas_revela_estrutura**: palpitar errado → `acertou=false` mas `estrutura_correta` presente e correto.
- **test_palpite_invalido_retorna_400**: `palpite="treap"` → 400.
- **test_palpite_token_adulterado_retorna_401**: trocar último char do token → 401.
- **test_palpite_token_expirado_retorna_404**: forjar token com `t` antigo e assinatura válida (reusa `token.encode` com timestamp passado) → 404.
- **test_palpite_idempotente**: 3 chamadas com mesmo payload → 3 respostas idênticas.
