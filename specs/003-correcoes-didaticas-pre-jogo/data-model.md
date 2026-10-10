# Data Model: Correções didáticas pré-jogo

**Feature**: 003-correcoes-didaticas-pre-jogo
**Data**: 2026-10-10

Entidades e estruturas afetadas por esta feature. Formatos "lógicos" (não JSON Schema).

---

## MinHeap (reescrito)

Representa um heap mínimo binário com tie-break FIFO.

| Atributo | Tipo | Descrição |
|---|---|---|
| `_data` | `list[tuple[int, int, T]]` | Array interno. Cada item é `(prioridade, contador, valor)`. |
| `_counter` | `int` | Contador monotônico de inserções, usado como tie-breaker FIFO. |

**Métodos públicos**:
- `push(priority: int, item: T) -> None`
- `pop() -> tuple[int, T]` — raise `IndexError` se vazio.
- `peek() -> tuple[int, T]` — raise `IndexError` se vazio.
- `is_empty() -> bool`
- `__len__() -> int`

**Métodos privados**:
- `_sift_up(idx: int) -> None` — sobe o item em `idx` enquanto `_data[idx] < _data[parent(idx)]`.
- `_sift_down(idx: int) -> None` — desce o item em `idx` enquanto for maior que algum filho.

**Invariantes**:
- Para todo `i > 0`: `_data[(i-1)//2] <= _data[i]`.
- Ordem total vem da comparação lexicográfica da tupla, então empates em `prioridade` são quebrados pelo `_counter` (menor contador = inserido antes = sai antes).

---

## Node[T]

Nó genérico de lista encadeada simples.

| Atributo | Tipo | Descrição |
|---|---|---|
| `valor` | `T` | Payload do nó. |
| `proximo` | `Node[T] | None` | Próximo nó na lista ou `None`. |

---

## LinkedList[T]

Lista encadeada genérica. Não é dupla, não tem iterador reverso.

| Atributo | Tipo | Descrição |
|---|---|---|
| `_head` | `Node[T] | None` | Primeiro nó, ou `None` se vazia. |
| `_tail` | `Node[T] | None` | Último nó (atalho para `push` O(1)), ou `None` se vazia. |
| `_tamanho` | `int` | Contador de elementos. |

**Métodos públicos**:
- `push(item: T) -> None` — anexa na cauda em O(1).
- `insert_at(pos: int, item: T) -> None` — insere em `pos`. `IndexError` se `pos < 0` ou `pos > len`.
- `remove_at(pos: int) -> T` — remove e retorna. `IndexError` se vazia ou fora de intervalo.
- `__iter__() -> Iterator[T]` — percorre em ordem a partir de `_head`.
- `__len__() -> int`.

**Invariantes**:
- `_head is None` ↔ `_tail is None` ↔ `_tamanho == 0`.
- Caminhar `_head.proximo` chega a `_tail` em exatamente `_tamanho - 1` passos.

---

## Bloco (dataclass)

Representa um bloco de memória no alocador.

| Atributo | Tipo | Descrição |
|---|---|---|
| `inicio` | `int` | Endereço inicial (0-indexed). |
| `tamanho` | `int` | Tamanho em palavras. |
| `livre` | `bool` | `True` se disponível para alocação. |

**Validação**: `tamanho > 0`; `inicio >= 0`.

---

## Alocador

Alocador first-fit sobre `LinkedList[Bloco]`.

| Atributo | Tipo | Descrição |
|---|---|---|
| `_lista` | `LinkedList[Bloco]` | Cadeia de blocos (livres e ocupados). |

**Métodos públicos**:
- `__init__(capacidade: int)` — inicia com um único bloco livre `Bloco(0, capacidade, True)`.
- `alocar(tamanho: int) -> Bloco | None` — percorre `_lista`, acha primeiro bloco livre com `tamanho_livre >= tamanho`, divide se sobrar.
- `liberar(bloco: Bloco) -> None` — marca `bloco.livre = True` e coalesce com vizinhos livres (anterior e próximo).
- `estado() -> list[dict]` — snapshot para o frontend: `[{inicio, tamanho, livre}, ...]` em ordem de posição.

**Invariantes**:
- Soma de `tamanho` em `_lista` é constante e igual à `capacidade` inicial.
- Dois blocos livres consecutivos nunca existem (foram coalescidos no `liberar` anterior).

---

## PassoRelaxamento (envelope reutilizado)

Entrada na lista `passos` do resultado de Dijkstra. Reaproveita o envelope `Passo` da feature 002.

| Campo | Tipo | Exemplo |
|---|---|---|
| `indice` | `int` | `3` |
| `descricao` | `str` | `"Olhando aresta A→B (peso 4). Custo atual de B é ∞. Via A dá 7 → atualizo B para 7."` |
| `destaques` | `list[str]` | `["no:A", "no:B", "aresta:A-B"]` |
| `estado` | `dict` | `{"distancias": {"A": 3, "B": 7, "C": null}, "visitados": ["A"]}` |

**Convenções de destaque**:
- `no:<rotulo>` — destaca um nó.
- `aresta:<origem>-<destino>` — destaca uma aresta direcionada.

**Convenção de distâncias**:
- `null` no JSON representa distância infinita (nó ainda não alcançado).
- Serializer converte `float("inf")` interno para `null`.

**Variantes de passo em Dijkstra**:
1. **Visita** (nó sai do heap): descrição "Visitando A (custo = 3). Explorando vizinhos...".
2. **Relaxamento com atualização**: descrição "...via A dá X → atualizo...".
3. **Relaxamento sem atualização**: descrição "...via A dá X (pior/igual) → mantenho...".
4. **Finalização**: descrição "Nó A finalizado com custo 3." (já existe hoje).

---

## Entidades inalteradas

As entidades abaixo são tocadas pela feature mas não têm mudança de estrutura:

- `HashTable` — correção foi em `comparar_busca`, não em atributos.
- `BST` — nenhuma mudança de código; só texto educacional no frontend.

---

## Diagrama de relacionamentos

```text
Alocador
  └── _lista: LinkedList[Bloco]
        ├── _head → Node[Bloco] ── proximo → Node[Bloco] → ...
        └── _tail (atalho O(1) para push)

MinHeap
  └── _data: list[tuple[int, int, T]]

Graph (Dijkstra)
  └── passos: list[Passo]       # envelope da feature 002
        └── Passo
              ├── indice: int
              ├── descricao: str
              ├── destaques: list[str]
              └── estado: {distancias: dict, visitados: list}
```
