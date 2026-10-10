# Research: Correções didáticas pré-jogo

**Data**: 2026-10-10
**Feature**: 003-correcoes-didaticas-pre-jogo

Documenta as decisões técnicas tomadas durante a fase 0 do plano. Nenhum `NEEDS CLARIFICATION` ficou em aberto.

---

## D1 — Heap: sift manual sem `heapq`

**Decisão**: Reescrever `MinHeap` com array interno `list[tuple[int,int,T]]` representando `(prioridade, contador, item)`. Implementar `_sift_up(idx)` e `_sift_down(idx)` manualmente usando aritmética de índice `(idx-1)//2` para pai, `2*idx+1`/`2*idx+2` para filhos. Comparação usa a tupla composta (prioridade, contador) para preservar FIFO entre empates.

**Rationale**:
- Objetivo didático: o site ENSINA heap. Esconder sift-up/down dentro de `heapq` zera o valor pedagógico.
- Preparação para feature 004 (jogo): se o jogo quiser instrumentar passos do heap, precisa dos sifts expostos no código próprio.
- API pública (`push`, `pop`, `peek`, `is_empty`, `__len__`) e comportamento (ordem, tie-break, exceções) permanecem idênticos — testes atuais continuam passando sem modificação.

**Alternativas consideradas**:
- Manter `heapq` como wrapper e deixar sift para feature 004 → rejeitado: adia dívida e deixa o módulo didático incoerente no interim.
- Reimplementar com `list` + swaps mas delegando `_siftup`/`_siftdown` do `heapq._siftup` interno → rejeitado: depende de API privada do stdlib; frágil.
- Max-heap em vez de min-heap → rejeitado: todos os uses (escalonador por prioridade crescente, roteamento com Dijkstra) assumem min-heap.

---

## D2 — LinkedList genérica + Alocador separado

**Decisão**: Separar em dois arquivos:

- `backend/core/estruturas/linked_list.py` — somente `Node[T]` + `LinkedList[T]` com API mínima:
  - `push(item: T) -> None` — anexa na cauda.
  - `insert_at(pos: int, item: T) -> None` — insere na posição; `IndexError` se fora de intervalo.
  - `remove_at(pos: int) -> T` — remove e retorna; `IndexError` se vazio ou fora de intervalo.
  - `__iter__() -> Iterator[T]` — percorre em ordem.
  - `__len__() -> int`.

- `backend/core/estruturas/alocador.py` — contém `Bloco` (dataclass com `inicio: int, tamanho: int, livre: bool`) e `Alocador` que mantém `_lista: LinkedList[Bloco]`. Operações:
  - `alocar(tamanho: int) -> Bloco | None` — first-fit sobre `_lista`; divide bloco se sobrar espaço.
  - `liberar(bloco: Bloco) -> None` — marca livre e coalesce com vizinhos livres.
  - `estado() -> list[dict]` — snapshot para o frontend.

**Rationale**:
- Nome do arquivo deve descrever o conteúdo. `linked_list.py` com um alocador dentro é mentira.
- Separação permite reutilizar `LinkedList[T]` na feature 004 (jogo) sem arrastar a lógica de alocação.
- Mantém Core-First: alocador consome `LinkedList`, mas ambos são Python puro.

**Alternativas consideradas**:
- Apenas renomear `linked_list.py` → `alocador.py` sem extrair `LinkedList[T]` → rejeitado: perde a oportunidade de ter a classe reutilizável, e um dos projetos é literalmente ensinar linked list por baixo do alocador.
- Deixar `LinkedList[T]` dentro de `alocador.py` como classe aninhada → rejeitado: `LinkedList[T]` precisa ser importável de outros módulos (feature 004).
- Fazer `LinkedList[T]` dupla (sentinel head/tail) para evitar casos especiais → rejeitado: complexidade didática desnecessária. Usamos head simples + atalho para tail para `push` O(1).

---

## D3 — BST: documentar caso degenerado

**Decisão**: Adicionar frase ao campo `textoEd` do projeto `indice-bst` em `frontend/content/projetos.ts`. Formato sugerido:

> "**Pior caso:** a BST não rebalanceia. Se os valores forem inseridos em ordem crescente ou decrescente, a árvore degenera em uma estrutura equivalente a uma lista encadeada, e a busca passa a custar O(n). Em cenários reais usamos árvores balanceadas (AVL, Red-Black); aqui focamos na BST pura para ver a mecânica."

**Rationale**:
- Mentira por omissão: hoje o texto fala de O(log n) sem ressalva.
- Preparação para o jogo: pode mostrar uma BST degenerada e perguntar "isso é BST ou lista encadeada?" — se o texto não ensinou, a pergunta é injusta.

**Alternativas consideradas**:
- Adicionar seção visual mostrando BST degenerada → rejeitado: escopo desta feature é só texto.
- Implementar balanceamento → rejeitado: fora de escopo, outra feature.

---

## D4 — Dijkstra: passos de relaxamento

**Decisão**: Em `graph.py`, dentro do loop que explora vizinhos do nó popado do heap, emitir UM passo por aresta visitada ANTES de empurrar o vizinho de volta no heap. Descrição em linguagem natural com os valores corretos.

Estrutura do passo:

```python
{
    "indice": N,
    "descricao": "Olhando aresta A→B (peso 4). Custo atual de B é ∞. Via A dá 7 → atualizo B para 7.",
    "destaques": ["no:A", "no:B", "aresta:A-B"],
    "estado": {
        "distancias": {"A": 3, "B": 7, "C": ∞, ...},
        "visitados": ["A"],
    },
}
```

Para caso em que o relaxamento NÃO atualiza:

> "Olhando aresta A→B (peso 4). Custo atual de B é 5. Via A dá 7 → mantenho B em 5."

**Rationale**:
- Passo de finalização (nó sai do heap) já existe e explica a conclusão. Relaxamento é a mecânica que distingue Dijkstra dos outros SSSP (BFS, Bellman-Ford).
- Snapshot de distâncias no `estado` permite ao frontend desenhar a tabela de distâncias atualizando passo a passo (quando a feature 004 ou futura iteração usar).
- Retrocompatível: `passos` já é um array; o frontend atual não consome, então crescer não quebra nada.

**Alternativas consideradas**:
- Representar `∞` como string `"∞"` → rejeitado: usar `float("inf")` e deixar serializer converter para `null` no JSON é mais limpo e aceito pelo frontend como "não alcançado".
- Agregar múltiplos relaxamentos num só passo por iteração do heap → rejeitado: perde granularidade didática.
- Emitir passo também para arestas que levam a nós já visitados (não relaxam) → aceito: inclui todas as arestas de saída do nó corrente, para consistência (o aluno vê o algoritmo "pensando" em cada aresta).

---

## D5 — Rollout e ordem de implementação

**Decisão**: Executar os fixes nesta ordem, um commit por fix:

1. **Heap manual** — menor blast radius (não muda contrato, só reescrita interna).
2. **BST texto didático** — zero risco técnico (string estática no frontend).
3. **LinkedList + Alocador split** — ajuste de imports é a parte sensível; isolado em 1 commit.
4. **Dijkstra relaxamento** — passos novos; precisa de teste de regressão para garantir distâncias iguais.

Cada commit roda `pytest` inteiro + `vitest` inteiro antes de ser criado. Nenhum fix fica pela metade.

**Rationale**:
- Permite reverter um fix sem desfazer os outros.
- Mantém o site rodável em cada ponto da branch (CI verde a cada commit).
- Ordem crescente de risco: se algo quebrar, o commit culpado é óbvio.

---

## Decisões descartadas / não-decisões

- **Instrumentar passos do heap (sift-up/down com narração)** — fora de escopo. Entra na feature 004 se o jogo precisar.
- **Rebalanceamento de BST** — fora de escopo. Documentar o caso degenerado é suficiente aqui.
- **Trocar `heapq` por `MinHeap` manual nos consumidores (escalonador, roteamento)** — não é decisão: isso já acontece automaticamente porque ambos importam `MinHeap`, não `heapq` diretamente.
