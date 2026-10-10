# Data Model: Jogo "Adivinhe a Estrutura"

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Data**: 2026-10-10

Nenhuma persistência relacional (não há banco). Todas as entidades abaixo são tipos efêmeros Python/TypeScript que vivem em memória de requisição ou dentro de um token assinado.

---

## 1. Rodada (backend, in-memory)

Produzida por `sortear(seed)` e enviada ao cliente.

```python
@dataclass
class Rodada:
    token: str              # HMAC-assinado, carrega estrutura+seed+timestamp
    passos: list[Passo]     # mesmo tipo da feature 002 (passos.py)
```

Nunca persistida. Apenas serializada no response de `GET /rodada`.

---

## 2. ClaimsRodada (dentro do token)

Payload JSON do token, antes de ser codificado em base64url + assinado.

```python
class ClaimsRodada(TypedDict):
    e: str   # estrutura correta: "pilha" | "fila" | "heap" | "hash" | "bst" | "linkedlist" | "grafo"
    s: int   # seed usada (sempre inteiro — se usuário não forneceu, backend gerou)
    t: int   # timestamp UNIX de emissão (segundos)
```

**Regras:**

- `e` ∈ `ESTRUTURAS_VALIDAS = {"pilha", "fila", "heap", "hash", "bst", "linkedlist", "grafo"}`.
- `t`: segundos desde epoch; usado para expiração (`now - t < TTL_SEGUNDOS`).
- `TTL_SEGUNDOS = 3600` (1 hora, conforme FR-011).

---

## 3. Token (string serializada)

Formato: `base64url(json(claims)) + "." + base64url(hmac_sha256(payload, SECRET_KEY))`.

Validação (`token.decode(s: str) -> ClaimsRodada`):

1. Split em `.`; falhou → `TokenInvalido`.
2. Recomputar HMAC do payload; se não bate → `TokenInvalido`.
3. Parsear JSON; se falhar → `TokenInvalido`.
4. Verificar `e` nas 7 estruturas → `TokenInvalido` se não.
5. Verificar `now - t < TTL_SEGUNDOS` → `TokenExpirado` se não.

---

## 4. Palpite (request body, POST /palpite)

```python
class PalpiteRequest(TypedDict):
    token: str
    palpite: str   # uma das 7 estruturas; validado via serializer DRF (ChoiceField)
```

**Regras:**

- `palpite` ∈ `ESTRUTURAS_VALIDAS`.
- Validação de `palpite` acontece no serializer (apps/jogo_adivinhe/serializers.py); se inválido → 400.

---

## 5. Veredito (response de POST /palpite)

```python
@dataclass
class Veredito:
    acertou: bool
    estrutura_correta: str   # sempre revelada, mesmo em erro
    explicacao: str          # 1–2 frases do dict EXPLICACOES
```

**Regras:**

- `acertou = (palpite == claims.e)`.
- `estrutura_correta = claims.e`.
- `explicacao = EXPLICACOES[claims.e]`.

---

## 6. Passo (reuso da feature 002)

Nenhuma mudança neste tipo. Importado de `backend/core/estruturas/passos.py`:

```python
class Passo(TypedDict):
    indice: int
    descricao: str
    destaques: list[str]
    estado: object
```

Apenas restrição adicional desta feature: nenhum campo pode conter substrings da lista proibida (ver [research.md D2](./research.md#d2--lista-proibida-e-varredura-de-neutralidade)).

---

## 7. OperacaoJogavel (configuração interna de `operacoes.py`)

Não exposta ao cliente. Define o repertório do sorteador.

```python
@dataclass
class OperacaoJogavel:
    estrutura: str
    nome: str                                  # ex.: "push_pop", "dijkstra"
    executar: Callable[[random.Random], list[Passo]]
```

`executar(rng)` instancia a estrutura real de `core/estruturas/*.py`, aplica a operação com valores sorteados a partir do `rng` recebido, e retorna a lista de passos.

**Repertório mínimo (uma entrada por estrutura):**

| estrutura | nome | o que faz |
|---|---|---|
| pilha | `push_pop` | 3 pushes com valores aleatórios + 1 pop |
| fila | `enqueue_dequeue` | 3 enqueues + 1 dequeue |
| heap | `push_sift` | 4–5 pushes mostrando sift-up |
| hash | `inserir_colidir_buscar` | 3 chaves em colisão + 1 busca |
| bst | `inserir_buscar` | 4–5 insert_at + 1 search |
| linkedlist | `push_insert_remove` | push + insert_at + remove_at |
| grafo | `dijkstra_4nos` | Dijkstra em grafo de 4 nós fixo |

---

## 8. Transições de estado

Diagrama de estado da **Rodada** (do ponto de vista do servidor):

```
[Cliente abre /adivinhe]
       │
       ▼
GET /rodada?seed=…
       │
       ▼
sortear(seed) ──► varredura_neutra passa? ─── não ──► re-sortear (até 10x)
       │                     │
       │                    sim
       ▼                     ▼
emitir token  ──────► devolve {token, passos}
       │
       │        [cliente joga]
       ▼
POST /palpite {token, palpite}
       │
       ▼
decode(token) ─── TokenInvalido ──► 401
       │
TokenExpirado ──► 404
       │
       ▼
Veredito(acertou = palpite == e, …) ──► 200
```

Nenhum estado persistido entre requisições. O token É o estado.
