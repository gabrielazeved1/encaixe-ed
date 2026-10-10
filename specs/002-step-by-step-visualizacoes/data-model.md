# Phase 1 — Data Model

**Feature**: Modo Step-by-Step nas Visualizações
**Date**: 2026-10-10

Entidades, campos e invariantes. Nenhuma delas é persistida — todas vivem no payload da operação (backend → frontend) ou em estado efêmero (frontend durante a reprodução).

---

## Backend (Python puro, `backend/core/estruturas/passos.py`)

### `Passo` (TypedDict)

```python
from typing import TypedDict

type Destaque = str  # ex.: "no:30", "bucket:5", "frame:2"

class Passo(TypedDict):
    indice: int               # ≥ 0, sequencial, único no array de passos
    descricao: str            # pt-BR, não-vazia, ≤ 200 chars
    destaques: list[Destaque] # pode ser [], são identificadores interpretados pela visualização
    estado: object            # forma específica da estrutura (ver abaixo); JSON-serializável
```

**Invariantes**:

- `indice` começa em `0` e é denso: `passos[k].indice == k` para todo `k`.
- `descricao` nunca é string vazia (FR-002, FR-007; SC-002).
- `destaques` são opacos para o player; a visualização que decide o significado da string.
- `estado` é um snapshot imutável no instante do passo — mutar depois não altera o passo.

### `PassoColetor` (alias)

```python
type PassoColetor = list[Passo]
```

Passado por referência às funções de simulação. Quando `None`, a estrutura opera sem instrumentar.

### Formato de `estado` por projeto

#### `pilha.estado`

```python
type FramePilha = dict[str, object]  # {"nome_funcao": str, "argumento": int, "retorno": int | None, "profundidade": int}
type EstadoPilha = list[FramePilha]  # topo = último elemento
```

Reaproveita o `FrameDict` existente em `stack.py`. Nenhuma mudança de forma.

#### `bst.estado`

```python
type NoBst = dict[str, object] | None  # {"valor": int, "esq": NoBst, "dir": NoBst}
type EstadoBst = NoBst
```

Reaproveita `BST.para_dict()`.

#### `hash.estado`

```python
type ParChaveValor = tuple[str, object]
type EstadoHash = dict[str, object]
# {"tamanho": int, "buckets": list[list[ParChaveValor]]}
```

Novo helper em `hash_table.py`: `HashTable.para_dict() -> EstadoHash`.

---

## Camada de resposta HTTP (envelope de endpoint)

Toda resposta dos três endpoints migrados ganha a chave `passos` em adição aos campos existentes:

```json
{
  "...": "campos legados mantidos para compat (research.md §6)",
  "passos": [
    { "indice": 0, "descricao": "...", "destaques": [], "estado": { ... } },
    ...
  ]
}
```

Nenhuma nova rota é criada. Nenhum campo legado é removido nesta feature.

---

## Frontend (`frontend/types/passos.ts`)

### `Passo<E>` (genérico no estado)

```ts
export type Passo<E> = {
  indice: number;
  descricao: string;
  destaques: string[];
  estado: E;
};
```

### Estados específicos

```ts
export type FramePilha = {
  nome_funcao: string;
  argumento: number;
  retorno: number | null;
  profundidade: number;
};
export type EstadoPilha = FramePilha[];

export type NoBst = { valor: number; esq: NoBst | null; dir: NoBst | null } | null;
export type EstadoBst = NoBst;

export type EstadoHash = {
  tamanho: number;
  buckets: Array<Array<[string, unknown]>>;
};
```

### Aliases por projeto

```ts
export type PassoPilha = Passo<EstadoPilha>;
export type PassoBst = Passo<EstadoBst>;
export type PassoHash = Passo<EstadoHash>;
```

### `EstadoDeReprodução` (local ao hook `useStepPlayer`)

```ts
export type EstadoDeReproducao = {
  indice: number;      // 0 ≤ indice ≤ passos.length - 1
  tocando: boolean;    // true = auto-play ativo
  velocidade: number;  // multiplicador: 0.5 | 1 | 2 (ou slider contínuo)
};
```

Não é serializado em lugar nenhum. Vive só no React state.

---

## Transições de estado (reprodução)

```text
inicial ──play──► tocando ──pause──► pausado
   ▲                 │                   │
   │                 │ atingiu fim       │
   │                 ▼                   │
   └─────reset──── finalizado ◄──step────┘
```

- `inicial`: `indice=0`, `tocando=false`.
- `tocando`: `tocando=true`; a cada `tick` da velocidade, `indice += 1`. Ao atingir `passos.length - 1`, transiciona para `finalizado` (FR-009).
- `pausado`: `tocando=false`; `step forward/backward` ajustam `indice`.
- `finalizado`: `indice == passos.length - 1`, `tocando=false`; `step forward` desabilitado.
- `reset`: volta para `inicial`.

Disparar nova operação (FR-010) descarta todo o estado e volta a `inicial` com a nova lista de passos.

---

## Validações

| Regra                                                   | Onde é garantida                                    |
| ------------------------------------------------------- | --------------------------------------------------- |
| `indice` é denso e começa em 0                          | helper `fazer_passo(coletor, ...)` em `passos.py`   |
| `descricao` não-vazia                                   | asserção no helper + teste unitário por operação    |
| `estado` é JSON-serializável                            | teste unitário faz `json.dumps(passo)`              |
| Nova operação cancela reprodução em curso               | `useStepPlayer` reseta ao mudar `passos` por `useEffect` |
| Mudar velocidade durante play afeta próximo intervalo   | `useStepPlayer` lê `velocidade` dentro do `setTimeout` |
