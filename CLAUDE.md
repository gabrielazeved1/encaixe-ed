# Encaixe — Estruturas de Dados em Ação

Guia de desenvolvimento para o Claude Code neste projeto.
A especificação completa está em `spec-site-estruturas-de-dados.md` — leia antes de qualquer tarefa.

---

## Stack (não-negociável)

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14+ App Router · TypeScript strict · Tailwind CSS |
| Backend | Django 5+ · Django REST Framework |
| Testes | pytest (backend) · vitest (frontend) |
| Python | 3.14.7 via pyenv (`.python-version` na raiz) |
| Deploy | Vercel (frontend) · Render (backend) |

Não adicionar dependências fora dessa lista sem discutir primeiro.

---

## Arquitetura

```
Next.js (app/) → lib/api.ts → Django views → core/estruturas/*.py
```

**Regra central:** as implementações das estruturas de dados ficam em
`backend/core/estruturas/` como módulos Python puro — sem nenhum import de
Django. As views só validam entrada (via serializers) e chamam essas funções.
Isso garante que cada estrutura seja testável isoladamente.

```
backend/
  config/          ← settings, urls raiz, wsgi/asgi
  core/estruturas/ ← Stack, Queue, Heap, HashTable, BST, LinkedList, Graph
  apps/            ← pilha, escalonador, roteamento, graus_separacao,
                      busca_hash, indice_bst, alocador_memoria
                      (cada app: views.py, serializers.py, urls.py, tests.py)

frontend/
  app/             ← page.tsx (home), projetos/page.tsx, projetos/[slug]/
  components/ui/   ← componentes genéricos reutilizáveis
  components/projetos/ ← visualizações específicas (PilhaVisual, GrafoVisual…)
  hooks/           ← usePilhaSimulacao, useEscalonador… (fetch, nunca nos componentes)
  lib/api.ts       ← único ponto de entrada para chamadas HTTP
  content/projetos.ts ← metadados + textos educacionais de todos os 7 projetos
```

---

## Setup inicial (uma vez)

```bash
# Backend — criar e ativar virtualenv
python -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt

# Frontend
cd frontend && npm install
```

O `.venv` já está no `.gitignore`. Sempre ativar com `source backend/.venv/bin/activate`
antes de rodar o servidor Django ou os testes pytest.

---

## Padrões de código

### Backend (Python)
- Type hints em toda função e classe pública.
- Views magras: validar com serializer → chamar `core/estruturas/` → retornar JSON.
  Nenhuma lógica de estrutura de dados dentro de uma view.
- Mesmo `Heap` reutilizado por `escalonador` e `roteamento`.
- Docstrings apenas quando o **porquê** da decisão não for óbvio pelo código.
- Testes: `pytest` unitário para cada estrutura isolada; integração para cada endpoint.

### Frontend (TypeScript)
- `strict: true` no `tsconfig.json` — sem exceções.
- Componentes de UI não fazem fetch. Um hook por mini-projeto cuida disso.
- Nenhum componente importa `fetch` diretamente — tudo passa por `lib/api.ts`.
- Textos educacionais e metadados ficam em `content/projetos.ts`, nunca inline.
- ESLint + Prettier configurados desde o primeiro commit.

---

## Workflow Spec Kit

Este projeto usa [Spec Kit](https://github.com/github/spec-kit) para
desenvolvimento orientado por especificação. O fluxo padrão para cada feature
(cada um dos 7 mini-projetos) é:

```
/speckit-constitution  ← uma vez por projeto, define os princípios (já mapeado
                          para este CLAUDE.md e a spec)
/speckit-specify       ← descreve O QUÊ e POR QUÊ da feature, sem entrar em como
/speckit-specify       ← (opcional) /speckit-clarify antes se houver ambiguidade
/speckit-plan          ← plano técnico: arquitetura, stack, estrutura de arquivos
/speckit-checklist     ← (opcional) valida completude do plano
/speckit-tasks         ← quebra o plano em tarefas pequenas e revisáveis
/speckit-analyze       ← (opcional) consistência entre spec/plan/tasks
/speckit-implement     ← gera código tarefa por tarefa
/speckit-converge      ← valida o que foi feito, apenda o que falta como tarefas
```

**Artifacts gerados pelo Spec Kit:** `.specify/memory/`
(constitution.md, spec-*.md, plan-*.md, tasks-*.md — não editar manualmente)

**Ordem de implementação dos mini-projetos** (conforme roadmap da spec):
1. Backend: 7 estruturas puras em `core/estruturas/` + testes pytest
2. Backend: 7 endpoints, um a um, validado com curl antes de avançar
3. Frontend: Home + lista de projetos com dados mockados
4. Frontend: `pilha` end-to-end (primeiro caso real de integração)
5. Repetir integração para os outros 6 projetos

---

## Organização dos arquivos Markdown

| Arquivo | Propósito |
|---|---|
| `spec-site-estruturas-de-dados.md` | Visão e especificação master do projeto — fonte da verdade |
| `CLAUDE.md` | Guia de desenvolvimento para o Claude Code (este arquivo) |
| `README.md` | Apresentação pública do projeto |
| `.specify/memory/constitution.md` | Constituição gerada/atualizada pelo `/speckit-constitution` |
| `.specify/memory/spec-<slug>.md` | Spec de cada feature gerada pelo `/speckit-specify` |
| `.specify/memory/plan-<slug>.md` | Plano técnico gerado pelo `/speckit-plan` |
| `.specify/memory/tasks-<slug>.md` | Tarefas geradas pelo `/speckit-tasks` |

Não criar outros `.md` na raiz. Se precisar de documentação extra, vai em `docs/`.

---

## Convenção de commits

Mensagens em português, imperativo, sem ponto final na primeira linha.
Formato: `tipo(escopo): descrição curta`

Tipos: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.

Sem atribuição ao assistente — commits são assinados apenas pelo autor humano.

Exemplos:

```text
feat(pilha): implementa simulação de call stack com animação de push/pop
test(core): adiciona testes unitários para Stack e Queue
chore: configura estrutura inicial do projeto
```

---

## Backlog / fora do escopo inicial

Anotado aqui para não perder — não implementar até a v1 estar completa:

- Array e Array Ordenado (cobertos no manual, sem mini-projeto definido)
- Projetos ligados a Sistemas Distribuídos (aguardando cursar a disciplina)
- Autenticação/login — site é público, sem persistência entre sessões
