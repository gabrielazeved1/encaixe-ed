# Encaixe

> Estruturas de dados clássicas rodando de verdade — 7 mini-projetos interativos que mostram onde cada estrutura aparece nas disciplinas do curso de engenharia.

**Demo:** [encaixe-ed.vercel.app](https://encaixe-ed-omega.vercel.app)

---

Pilha, fila, heap, grafo, hash table, BST, lista encadeada. Você aprende numa disciplina, esquece o nome, reencontra em outra com uma roupa diferente — e só depois percebe que era a mesma coisa o tempo todo.

O Encaixe torna essa conexão explícita.

Cada projeto pega uma estrutura de dados, mostra ela funcionando num cenário real (call stack, escalonamento de processos, roteamento Dijkstra, graus de separação, busca com hash, índice em banco de dados, alocador de memória) e aponta: *essa estrutura aparece aqui, aqui e aqui no seu curso.*

→ [Por que fundamentos ainda importam?](FUNDAMENTOS.md)

---

## Demo

| Mini-projeto | Estrutura |
| --- | --- |
| Visualizador de Pilha de Chamadas | Pilha |
| Escalonador de Processos | Fila + Heap |
| Roteamento com Dijkstra | Grafo Ponderado |
| Graus de Separação | Grafo Não Ponderado |
| Busca Linear vs. Hash Table | Hash Table |
| Índice com Árvore Binária | BST |
| Alocador de Memória | Lista Encadeada |

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | Next.js 14 · App Router · TypeScript strict · Tailwind CSS |
| Backend | Django 5 · Django REST Framework · Python 3.14 |
| Testes | pytest · vitest |
| Deploy | Vercel (frontend) · Render (backend) |

---

## Rodar localmente

**Pré-requisitos:** Python 3.14+ · Node.js 18+

```bash
# backend
python -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
cd backend && python manage.py runserver

# frontend (outro terminal)
cd frontend && npm install && npm run dev
```

Acesse `http://localhost:3000`.

---

## Estrutura

```text
backend/
  core/estruturas/   ← estruturas de dados em Python puro (sem Django)
  apps/              ← um app por mini-projeto (views, serializers, urls)
  config/            ← settings, urls raiz, wsgi

frontend/
  app/               ← rotas Next.js
  components/        ← visualizações interativas por projeto
  content/projetos.ts ← metadados e textos educacionais dos 7 projetos
  hooks/             ← um hook por mini-projeto (toda comunicação HTTP)
  lib/api.ts         ← único ponto de entrada para chamadas ao backend
```

A regra central: as estruturas de dados ficam em `core/estruturas/` como módulos Python puro, sem nenhum import de Django. São testáveis isoladamente com `pytest`. As views só validam entrada e chamam essas funções.

---

Feito no último semestre de Engenharia de Computação na UFU — por curiosidade, sem nota, sem prazo.
