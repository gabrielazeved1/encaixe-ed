# Encaixe — Estruturas de Dados em Ação

Site educacional com 7 mini-projetos interativos que mostram estruturas de dados clássicas resolvendo problemas reais — conectadas às disciplinas onde elas reaparecem com outros nomes.

**Demo:** [encaixe-ed.vercel.app](https://encaixe-ed.vercel.app)

---

## Pré-requisitos

- Python 3.14+ (via [pyenv](https://github.com/pyenv/pyenv))
- Node.js 18+

---

## Setup

### Backend

```bash
python -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
cd backend && python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse em `http://localhost:3000`.

---

## Stack

| Camada   | Tecnologia                                                 |
| -------- | ---------------------------------------------------------- |
| Frontend | Next.js 14 · App Router · TypeScript strict · Tailwind CSS |
| Backend  | Django 5 · Django REST Framework · Python 3.14             |
| Testes   | pytest (backend) · vitest (frontend)                       |
| Deploy   | Vercel (frontend) · Render (backend)                       |

---

## Estrutura

```
backend/
  core/estruturas/   ← estruturas de dados em Python puro (sem Django)
  apps/              ← pilha, escalonador, roteamento, graus_separacao,
                        busca_hash, indice_bst, alocador_memoria
  config/            ← settings, urls, wsgi

frontend/
  app/               ← rotas Next.js (home, projetos, adivinhe, sobre)
  components/        ← UI e visualizações específicas por projeto
  content/
    projetos.ts      ← metadados e textos educacionais dos 7 projetos
  hooks/             ← um hook por mini-projeto (fetch, nunca nos componentes)
  lib/api.ts         ← único ponto de entrada para chamadas HTTP
```

---

## Mini-projetos

| Projeto                           | Estrutura           |
| --------------------------------- | ------------------- |
| Visualizador de Pilha de Chamadas | Pilha               |
| Escalonador de Processos          | Fila + Heap         |
| Roteamento com Dijkstra           | Grafo Ponderado     |
| Graus de Separação                | Grafo Não Ponderado |
| Busca Linear vs. Hash Table       | Hash Table          |
| Índice com Árvore Binária         | BST                 |
| Alocador de Memória               | Lista Encadeada     |
