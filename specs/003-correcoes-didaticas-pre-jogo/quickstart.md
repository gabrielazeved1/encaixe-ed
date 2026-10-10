# Quickstart: Correções didáticas pré-jogo

**Feature**: 003-correcoes-didaticas-pre-jogo
**Objetivo**: validar as 5 correções em ~10 minutos.

---

## Pré-requisitos

- `.venv` ativo no backend: `source backend/.venv/bin/activate`
- Dependências frontend instaladas: `cd frontend && npm install`
- Testes do projeto rodando no estado inicial (antes das correções):
  ```bash
  cd backend && pytest -q
  cd ../frontend && npm run test
  ```

---

## Cenário 1 — US1: hash `encontrado` correto (já feito)

**Verificar o teste de regressão existente passa:**

```bash
cd backend && pytest core/estruturas/tests/test_hash_table.py::test_hash_encontrado_vem_do_resultado_da_busca_hash -v
```

Esperado: PASSED.

---

## Cenário 2 — US2: heap com sift manual

**Antes:**

```bash
grep -n "heapq" backend/core/estruturas/heap.py
# → deve retornar linhas (hoje o heap importa heapq)
```

**Depois (após o fix):**

```bash
grep -n "heapq" backend/core/estruturas/heap.py
# → sem resultado (nenhum import de heapq)

grep -n "_sift_up\|_sift_down" backend/core/estruturas/heap.py
# → pelo menos 4 ocorrências (métodos definidos e chamados)

pytest core/estruturas/tests/test_heap.py -v
# → todos passam, inclusive os novos testes de _sift_up/_sift_down
```

Rodar também os consumidores do heap para garantir que não quebraram:

```bash
pytest backend/apps/escalonador backend/apps/roteamento -v
```

---

## Cenário 3 — US3: LinkedList genérica + Alocador separado

**Antes:**

```bash
ls backend/core/estruturas/linked_list.py
# → arquivo com lógica de alocador

ls backend/core/estruturas/alocador.py 2>&1
# → No such file or directory
```

**Depois:**

```bash
ls backend/core/estruturas/linked_list.py backend/core/estruturas/alocador.py
# → ambos existem

grep -n "alocar\|liberar" backend/core/estruturas/linked_list.py
# → sem resultado (lógica saiu dali)

grep -n "class LinkedList\|insert_at\|remove_at\|push" backend/core/estruturas/linked_list.py
# → classe genérica com os métodos esperados

pytest core/estruturas/tests/test_linked_list.py core/estruturas/tests/test_alocador.py -v
# → ambos passam
```

Verificar que o endpoint do alocador continua respondendo:

```bash
cd backend && python manage.py runserver &
BACKEND_PID=$!
sleep 2
curl -sX POST http://localhost:8000/api/alocador_memoria \
  -H "Content-Type: application/json" \
  -d '{"capacidade": 64, "operacoes": [{"tipo": "alocar", "tamanho": 16}]}'
kill $BACKEND_PID
```

A resposta deve ter o mesmo shape de antes.

---

## Cenário 4 — US4: BST texto didático

**Antes:**

```bash
grep -i "degenera\|O(n)" frontend/content/projetos.ts
# → sem resultado no bloco indice-bst
```

**Depois:**

```bash
grep -iA2 "degenera" frontend/content/projetos.ts
# → aparece frase sobre caso degenerado no projeto indice-bst
```

Validação visual: `cd frontend && npm run dev` → abrir http://localhost:3000/projetos/indice-bst → ler o `textoEd` renderizado — deve conter a frase sobre caso degenerado.

---

## Cenário 5 — US5: Dijkstra com relaxamento

**Antes:** salvar baseline em arquivo:

```bash
cd backend && python -c "
from core.estruturas.graph import simular_roteamento
r = simular_roteamento({...payload fixo...})
print('passos:', len(r['passos']))
print('distancias:', r['distancias'])
" > /tmp/dijkstra-baseline.txt
```

**Depois:**

```bash
pytest core/estruturas/tests/test_graph.py -v
# → novo teste de passos de relaxamento passa; teste de distâncias finais segue passando

python -c "
from core.estruturas.graph import simular_roteamento
r = simular_roteamento({...mesmo payload...})
print('passos:', len(r['passos']))
print('distancias:', r['distancias'])
" > /tmp/dijkstra-depois.txt

diff /tmp/dijkstra-baseline.txt /tmp/dijkstra-depois.txt
# → 'distancias' iguais; 'passos' cresceu
```

Teste de contrato (endpoint):

```bash
curl -sX POST http://localhost:8000/api/roteamento -H "Content-Type: application/json" \
  -d '{"origem": "A", "arestas": [...]}' | jq '.distancias'
# → idêntico ao baseline
```

---

## Checklist final

- [ ] `pytest` inteiro do backend passa (todas as apps + core).
- [ ] `npm run test` do frontend passa (nenhum teste frontend novo nessa feature).
- [ ] `npm run build` do frontend compila sem erro de tipo.
- [ ] `grep -n heapq backend/core/estruturas/heap.py` retorna vazio.
- [ ] `backend/core/estruturas/alocador.py` existe; `linked_list.py` não contém `alocar(`.
- [ ] `frontend/content/projetos.ts` contém frase sobre "degenerada" no `indice-bst`.
- [ ] Distâncias do Dijkstra em um grafo de referência são iguais às calculadas antes da reescrita.
- [ ] 5 commits criados, nessa ordem: hash (já feito), heap, bst-texto, alocador-split, dijkstra-relaxamento.
