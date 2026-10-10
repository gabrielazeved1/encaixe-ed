# Data Model — Jogo Adivinhe Modo Acadêmico

Entidades e tipos envolvidos. Todos vivem em `backend/core/jogo/` como dataclasses ou `TypedDict`s puros. Nenhum ORM, nenhum Django.

---

## Tipos primitivos

```python
Estrutura = Literal["pilha", "fila", "heap", "hash", "bst", "linkedlist", "grafo"]
Operacao = str   # ex.: "push_pop", "sift_up", "dijkstra_4nos" (set validado em OPERACOES)
Camada = Literal["estrutura", "operacao", "complexidade"]
Complexidade = Literal["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O((V+E) log V)"]
```

```typescript
// frontend
export type Estrutura = "pilha" | "fila" | "heap" | "hash" | "bst" | "linkedlist" | "grafo";
export type Camada = "estrutura" | "operacao" | "complexidade";
```

---

## OperacaoJogavel *(estendida — já existia na feature 004)*

Função executora + metadata semântica.

```python
@dataclass(frozen=True)
class OperacaoJogavel:
    estrutura: Estrutura
    nome: str                       # ex.: "push_pop"
    nome_tecnico: str               # ex.: "push + pop", "sift-up (percolate-up)", "Dijkstra"
    invariante: str                 # 1 frase; ex.: "LIFO: último inserido é o primeiro removido"
    complexidade_pior: Complexidade # ex.: "O(1)", "O(log n)"
    executar: Callable[[Random], list[Passo]]
```

Mudanças em relação à feature 004: ganhou `nome_tecnico`, `invariante`, `complexidade_pior`.

**Catálogo em `operacoes.py`:**

| Estrutura | nome | nome_tecnico | complexidade_pior |
| --- | --- | --- | --- |
| pilha | push_pop | push + pop | O(1) |
| fila | enqueue_dequeue | enqueue + dequeue | O(1) |
| heap | push_sift | SIFT-UP (percolate-up) | O(log n) |
| hash | inserir_colidir_buscar | encadeamento separado + busca | O(n) |
| bst | inserir_buscar | busca binária em árvore (pior caso degenerado) | O(n) |
| linkedlist | push_insert_remove | insert_at / remove_at (posição arbitrária) | O(n) |
| grafo | dijkstra_4nos | Dijkstra (via fila de prioridade) | O((V+E) log V) |

**Validações:**
- `complexidade_pior` MUST pertencer ao Literal `Complexidade`.
- `OPERACOES[estrutura]` MUST conter `nome` (consistência token).

---

## Pergunta *(interna, backend)*

Representa uma pergunta no banco antes de ser revelada ao frontend. Inclui gabarito.

```python
@dataclass(frozen=True)
class Pergunta:
    camada: Camada
    enunciado: str
    alternativas: tuple[str, str, str, str]   # exatamente 4
    indice_correto: int                        # 0..3
```

**Validações:**
- `len(alternativas) == 4`.
- `0 <= indice_correto < 4`.
- Para `camada == "estrutura"`: `varredura_neutra_texto(enunciado)` passa (sem nomes de estrutura no enunciado — mas pode conter nas alternativas).

---

## PerguntaRevelada *(enviada ao frontend)*

Pergunta sem gabarito. É o que vai no corpo da response.

```python
@dataclass(frozen=True)
class PerguntaRevelada:
    camada: Camada
    enunciado: str
    alternativas: list[str]   # 4 itens; ordem pode ser embaralhada por rng
```

```typescript
export type PerguntaRevelada = {
  camada: Camada;
  enunciado: string;
  alternativas: [string, string, string, string];
};
```

---

## BancoDePerguntas *(constante em `perguntas.py`)*

```python
BANCO: dict[tuple[Estrutura, Camada], list[Pergunta]]
```

**Regra:** `len(BANCO[(e, c)]) >= 2` para toda combinação `(e, c)`.

**Função pública:**
```python
def montar_pergunta(
    estrutura: Estrutura,
    operacao: Operacao,
    camada: Camada,
    rng: Random,
) -> Pergunta:
    """Sorteia 1 enunciado do banco e embaralha alternativas (atualizando indice_correto)."""
```

A função retorna `Pergunta` (com gabarito). Quem converte para `PerguntaRevelada` é o `sortear`/`avaliar`.

---

## Complexidade *(lookup em `complexidade.py`)*

```python
PIOR_CASO: dict[tuple[Estrutura, Operacao], Complexidade] = {
    ("pilha", "push_pop"): "O(1)",
    ("fila", "enqueue_dequeue"): "O(1)",
    ("heap", "push_sift"): "O(log n)",
    ("hash", "inserir_colidir_buscar"): "O(n)",
    ("bst", "inserir_buscar"): "O(n)",
    ("linkedlist", "push_insert_remove"): "O(n)",
    ("grafo", "dijkstra_4nos"): "O((V+E) log V)",
}

def pior_caso(estrutura: Estrutura, operacao: Operacao) -> Complexidade: ...
```

Invariante: `PIOR_CASO[(e, op)] == OPERACOES[e][op].complexidade_pior` para toda `(e, op)` cadastrada.

---

## Explicacao *(em `explicacoes.py`)*

```python
EXPLICACOES: dict[tuple[Estrutura, Camada], dict[Literal["acertou", "errou"], str]]
```

Cada texto 2–3 linhas, 100–300 chars.

**Validação:** `set(EXPLICACOES.keys()) == set(itertools.product(ESTRUTURAS, CAMADAS))` (todas as 21 combinações presentes).

**Função pública:**
```python
def obter_explicacao(estrutura: Estrutura, camada: Camada, acertou: bool) -> str: ...
```

---

## ClaimsRodada *(no token — estendido)*

Era `{e, s, t}`, agora `{e, op, s, t}`.

```python
class ClaimsRodada(TypedDict):
    e: Estrutura   # estrutura sorteada
    op: Operacao   # operação sorteada (adicionado nesta feature)
    s: int         # seed
    t: int         # timestamp de emissão (unix seconds)
```

**Validações em `decode()`:**
- `set(claims.keys()) == {"e", "op", "s", "t"}` (ordem canônica).
- `claims["e"] ∈ ESTRUTURAS_VALIDAS`.
- `claims["op"] ∈ OPERACOES[claims["e"]]` (set de nomes técnicos). **NOVO.**
- `agora - claims["t"] < TTL_SEGUNDOS` (1h).

---

## Rodada *(retornada por `/rodada`)*

```python
@dataclass(frozen=True)
class Rodada:
    token: str
    passos: list[Passo]
    pergunta_estrutura: PerguntaRevelada
```

**Validações:**
- `len(passos) >= 2`.
- `varredura_neutra(passos)` passa (herdada).
- `pergunta_estrutura.camada == "estrutura"`.

---

## VereditoParcial *(retornado por `/palpite`)*

Resposta de uma camada.

```python
@dataclass(frozen=True)
class VereditoParcial:
    camada: Camada
    acertou: bool
    correto: str                    # texto da alternativa correta
    explicacao: str                 # texto acadêmico
    proxima_pergunta: PerguntaRevelada | None  # None quando camada == "complexidade"
```

Regras:
- `camada == "estrutura"` → `proxima_pergunta.camada == "operacao"`.
- `camada == "operacao"` → `proxima_pergunta.camada == "complexidade"`.
- `camada == "complexidade"` → `proxima_pergunta is None` (último estágio).

---

## VereditoFinal *(montado pelo frontend)*

Não existe no backend; é construção do cliente.

```typescript
export type VereditoFinal = {
  pontuacao: 0 | 1 | 2 | 3;
  camadas: {
    estrutura: VereditoParcial;
    operacao: VereditoParcial;
    complexidade: VereditoParcial;
  };
};
```

---

## Palpite *(requisição `/palpite`)*

```python
class PalpiteRequest(TypedDict):
    token: str
    estagio: Camada
    palpite: str   # texto da alternativa escolhida
```

Validações:
- `estagio ∈ {"estrutura", "operacao", "complexidade"}`.
- `palpite` deve ser uma das 4 alternativas geradas pela função `montar_pergunta(estrutura, operacao, estagio, rng_derivado_do_seed)`. Se não bater com nenhuma, retorna 400 "palpite inválido".

---

## Fluxo de estados do frontend

```typescript
type EstadoCliente =
  | { tipo: "carregando" }
  | { tipo: "respondendo";
      camada: Camada;
      pergunta: PerguntaRevelada;
      selecionada: number | null;
      vereditosParciais: VereditoParcial[];   // 0, 1 ou 2 itens
      passos: Passo[];
      token: string;
    }
  | { tipo: "veredito";
      vereditos: [VereditoParcial, VereditoParcial, VereditoParcial];
      pontuacao: 0 | 1 | 2 | 3;
    }
  | { tipo: "erro"; mensagem: string };
```

**Transições:**
- `carregando → respondendo(estrutura)` após `GET /rodada`.
- `respondendo(estrutura) → respondendo(operacao)` após `POST /palpite {estagio: "estrutura"}` com sucesso.
- `respondendo(operacao) → respondendo(complexidade)` após `POST /palpite {estagio: "operacao"}` com sucesso.
- `respondendo(complexidade) → veredito` após `POST /palpite {estagio: "complexidade"}` com sucesso.
- Qualquer resposta de erro (401 token inválido, 404 expirado, 400 palpite inválido) → `erro`.

---

## Resumo visual

```
+---------------------+       +------------------+       +--------------------+
| OperacaoJogavel     |------>| Pergunta (banco) |------>| PerguntaRevelada   |
| (metadata técnica)  |       | (com gabarito)   |       | (sem gabarito,     |
+---------------------+       +------------------+       |  enviada ao front) |
         |                           ^                   +--------------------+
         |                           | montar_pergunta()
         v                           |
+---------------------+       +------------------+
| PIOR_CASO lookup    |       | BANCO: dict      |
| (complexidade.py)   |       | (estr, cam) ->   |
+---------------------+       | list[Pergunta]   |
                              +------------------+

+--------------+   avaliar()   +------------------+
| Palpite      |-------------->| VereditoParcial  |
| (request)    |               | (resposta /palpite)|
+--------------+               +------------------+
                                       |
                                       | 3x acumulado no frontend
                                       v
                               +------------------+
                               | VereditoFinal    |
                               | (só frontend)    |
                               +------------------+
```
