# Tasks: Polimento Pré-Deploy

**Input**: Design documents de `specs/006-polimento-pre-deploy/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · quickstart.md ✅

**Testes**: não solicitados — nenhuma tarefa de teste gerada.

**Organização**: tarefas agrupadas por user story para permitir implementação e validação independente.

## Formato: `[ID] [P?] [Story?] Descrição com caminho`

- **[P]**: pode rodar em paralelo (arquivos distintos, sem dependências entre si)
- **[Story]**: a qual user story a tarefa pertence (US1–US6)

---

## Phase 1: Setup

**Propósito**: confirmar que o ambiente de desenvolvimento está pronto antes das alterações.

- [x] T001 Confirmar que `backend/.venv` está ativo e Django sobe em `http://localhost:8000` e Next.js em `http://localhost:3000`

**Checkpoint**: ambiente OK — próximas fases podem ser executadas.

---

## Phase 2: Foundational (Pré-requisito para US5)

**Propósito**: adicionar o campo `pergunta` ao tipo `Projeto` em `frontend/content/projetos.ts`. Bloqueia US5 (home com perguntas). As demais user stories (US1, US2, US3, US4, US6) não dependem desta fase e podem ser iniciadas imediatamente após o Phase 1.

**⚠️ CRÍTICO**: US5 não pode ser implementado até esta fase estar completa.

- [ ] T002 Adicionar campo obrigatório `pergunta: string` ao tipo `Projeto` em `frontend/content/projetos.ts` (linha 15–25) — campo obrigatório, sem valor padrão
- [ ] T003 Preencher `pergunta` nos 7 objetos do array `projetos` em `frontend/content/projetos.ts` com os valores exatos do data-model.md: pilha → `"Por que um programa trava com recursão infinita?"` · escalonador → `"Como o sistema operacional decide qual processo roda agora?"` · roteamento → `"Como a internet escolhe o melhor caminho para um pacote?"` · graus-de-separacao → `"Em quantos saltos você chega a qualquer pessoa no LinkedIn?"` · busca-hash → `"Por que dict['chave'] é mais rápido do que buscar numa lista?"` · indice-bst → `"Por que criar um índice no banco de dados acelera tanto a query?"` · alocador-memoria → `"O que é um memory leak e por que ele trava o programa?"`
- [ ] T004 Verificar que `npm run build` (ou `tsc --noEmit`) em `frontend/` não gera erros de tipo após T002 e T003

**Checkpoint**: tipo `Projeto` atualizado e TypeScript limpo — US5 pode ser iniciada.

---

## Phase 3: US1 — Repositório sem artefatos de tooling (P1)

**Goal**: `.specify/` e `.claude/` removidos do índice Git; nenhum arquivo desses diretórios rastreado em commits futuros.

**Independent Test**: `git ls-files .specify/ .claude/` retorna vazio.

- [x] T005 [US1] Adicionar as entradas `.specify/` e `.claude/` ao `.gitignore` na raiz do repositório, após a entrada existente `# Spec Kit (drafts locais...)` (linha 52)
- [x] T006 [US1] Executar `git rm --cached -r .specify/` na raiz do repositório para remover todos os arquivos de `.specify/` do índice Git sem deletá-los localmente
- [x] T007 [US1] Verificar resultado: `git ls-files .specify/ .claude/` deve retornar vazio; `git status` não deve listar esses diretórios como untracked

**Checkpoint**: `git ls-files .specify/ .claude/` → nenhuma saída. US1 completa.

---

## Phase 4: US2 — README claro para novos visitantes (P1)

**Goal**: `README.md` reescrito com todas as seções necessárias para um colaborador sem contexto conseguir rodar o projeto localmente.

**Independent Test**: ler apenas o README e conseguir subir backend + frontend sem abrir outro arquivo.

- [x] T008 [US2] Reescrever `README.md` na raiz do repositório com as seguintes seções em ordem: (1) título "Encaixe" com descrição de 2–3 linhas; (2) link para o site em produção (placeholder `[em breve]` até o deploy estar no ar); (3) pré-requisitos: Python 3.14+, Node 18+, pyenv; (4) setup do backend: `python -m venv backend/.venv`, `source backend/.venv/bin/activate`, `pip install -r backend/requirements.txt`, `python manage.py runserver`; (5) setup do frontend: `cd frontend && npm install && npm run dev`; (6) tabela de stack (Frontend / Backend / Testes / Deploy); (7) estrutura de pastas resumida mostrando `backend/core/estruturas/`, `backend/apps/`, `frontend/app/`, `frontend/content/projetos.ts`, `frontend/components/`

**Checkpoint**: README completo com todas as 7 seções. US2 completa.

---

## Phase 5: US4 — Remoção de trecho da página Sobre (P2)

**Goal**: a frase "A leitura foi o gatilho — cada capítulo gerou um projeto, cada projeto gerou uma conexão com alguma disciplina da engenharia." não existe mais em `frontend/app/sobre/page.tsx`.

**Independent Test**: `grep -r "cada capítulo gerou um projeto" frontend/` retorna vazio.

- [x] T009 [US4] Remover o trecho `"A leitura foi o gatilho — cada capítulo gerou um projeto, cada projeto gerou uma conexão com alguma disciplina da engenharia."` do `<p>` dentro do `<div>` do livro na seção "Origem" em `frontend/app/sobre/page.tsx` (linhas 67–72); verificar que o parágrafo restante ainda faz sentido e o card do livro continua íntegro

**Checkpoint**: grep retorna vazio. US4 completa.

---

## Phase 6: US5 — Perguntas contextuais ao lado dos projetos na home (P2)

**Goal**: os 7 projetos com suas perguntas aparecem em uma seção visível na home, acima da dobra em desktop.

**Dependência**: requer Phase 2 completa (campo `pergunta` existente em `projetos`).

**Independent Test**: acessar `http://localhost:3000` e ver todos os 7 projetos com perguntas sem necessitar de scroll em desktop 1440px; layout não quebra em 375px (mobile).

- [ ] T010 [US5] Adicionar `import { projetos } from "@/content/projetos"` no topo de `frontend/app/page.tsx` (após os imports existentes)
- [ ] T011 [US5] Inserir nova `<section>` em `frontend/app/page.tsx` entre a seção dos feature cards (`border-t border-slate-800` com `FEATURES.map`) e a seção do card "Adivinhe a Estrutura" — a seção deve conter um título discreto (ex: `text-xs uppercase tracking-wider text-slate-500`) e uma lista dos 7 projetos; cada item é um `<Link href="/projetos/{slug}">` com o `nome` do projeto em `text-sm font-medium text-slate-300` e a `pergunta` em `text-xs text-slate-500`; usar grid `grid-cols-1` no mobile e `grid-cols-2` a partir de `sm:`
- [ ] T012 [P] [US5] Verificar visualmente em `http://localhost:3000`: (a) todos os 7 projetos aparecem com perguntas; (b) cada link navega para `/projetos/[slug]`; (c) layout não quebra em mobile via DevTools (375px)

**Checkpoint**: 7 projetos com perguntas visíveis na home. US5 completa.

---

## Phase 7: US3 — Imagem OG (P2)

**Goal**: site exibe imagem Open Graph ao ser compartilhado; meta tag `og:image` configurada no layout.

**Independent Test**: `View Source` em `http://localhost:3000` mostra `<meta property="og:image" ...>` apontando para `/og.png`.

- [x] T013 [US3] Criar arquivo SVG `frontend/public/og.svg` (viewBox 1200×630) com: fundo `#0d1117`; letra "E" grande centralizada à esquerda em `#3b82f6` (azul); texto "Encaixe" em branco `#ffffff` peso bold; tagline "Estruturas de Dados em Ação" em `#94a3b8` (slate-400); proporções que fiquem legíveis em thumbnail 600×315
- [x] T014 [US3] Exportar `frontend/public/og.svg` para `frontend/public/og.png` (mantido como SVG — browsers e OG previews aceitam) (1200×630) — pode usar Inkscape CLI (`inkscape --export-type=png`), ImageMagick (`convert`), ou salvar diretamente como PNG de qualquer editor; se nenhuma ferramenta disponível localmente, manter o SVG e configurar o `og:image` para apontar para `/og.svg` (browsers aceitam SVG em OG)
- [x] T015 [US3] Atualizar `frontend/app/layout.tsx`: expandir o objeto `metadata` adicionando `openGraph: { title: "Encaixe — Estruturas de Dados em Ação", description: "...", images: [{ url: "/og.png", width: 1200, height: 630 }], type: "website" }` e `twitter: { card: "summary_large_image", images: ["/og.png"] }`

**Checkpoint**: meta `og:image` presente no HTML. US3 completa.

---

## Phase 8: US6 — Deploy em produção (P1)

**Goal**: frontend no ar na Vercel; backend no ar no Render; chamadas cross-origin funcionando sem erros de CORS.

**Dependência**: todas as user stories anteriores devem estar completas e commitadas.

**Independent Test**: acessar URL de produção e interagir com pelo menos um mini-projeto end-to-end sem erros no DevTools.

- [ ] T016 [US6] Criar `frontend/.env.local.example` na raiz do `frontend/` documentando as variáveis necessárias: `NEXT_PUBLIC_API_URL=http://localhost:8000` (com comentário indicando que em produção deve apontar para o Render)
- [ ] T017 [P] [US6] Fazer deploy do backend no Render: criar novo Web Service apontando para `backend/` do repositório; configurar Build Command: `pip install -r requirements.txt`; Start Command: `gunicorn config.wsgi:application`; verificar se `gunicorn` está em `backend/requirements.txt`, adicionar se necessário
- [ ] T018 [P] [US6] Configurar variáveis de ambiente no Render: `SECRET_KEY` (gerar valor seguro), `DEBUG=False`, `ALLOWED_HOSTS=<subdomínio>.onrender.com`, `CORS_ALLOWED_ORIGINS=https://<subdomínio>.vercel.app` (usar placeholder até ter o URL do Vercel)
- [ ] T019 [US6] Fazer deploy do frontend na Vercel: importar repositório, definir Root Directory como `frontend`, configurar variável de ambiente `NEXT_PUBLIC_API_URL=https://<subdomínio>.onrender.com`
- [ ] T020 [US6] Atualizar `CORS_ALLOWED_ORIGINS` no Render com o URL definitivo do Vercel (após T019); atualizar o link de produção no `README.md` (T008) com o URL definitivo
- [ ] T021 [US6] Validar end-to-end com os cenários do `quickstart.md`: (a) home carrega < 3s; (b) chamar `/api/pilha/` via curl com Origin do Vercel e confirmar `Access-Control-Allow-Origin` correto; (c) interagir com um mini-projeto no site de produção e confirmar resposta sem erros

**Checkpoint**: site em produção funcionando. US6 completa.

---

## Phase 9: Polish & Validação Final

**Propósito**: verificações finais cruzando todas as user stories.

- [ ] T022 [P] Executar os comandos de validação do `quickstart.md` seção por seção e confirmar que todos os critérios de sucesso do `spec.md` (SC-001 a SC-007) passam
- [ ] T023 [P] Executar `git ls-files .specify/ .claude/` e confirmar saída vazia (SC-001)
- [ ] T024 [P] Executar `grep -r "cada capítulo gerou um projeto" frontend/` e confirmar saída vazia (SC-004)

---

## Dependências & Ordem de Execução

### Dependências entre fases

- **Phase 1 (Setup)**: sem dependências — iniciar imediatamente
- **Phase 2 (Foundational)**: depende de Phase 1 — bloqueia US5
- **Phase 3 (US1)**, **Phase 4 (US2)**, **Phase 5 (US4)**: independentes entre si, podem rodar em paralelo após Phase 1
- **Phase 6 (US5)**: depende de Phase 2 estar completa
- **Phase 7 (US3)**: independente das demais (exceto Phase 1)
- **Phase 8 (US6)**: depende de todas as fases anteriores estarem completas e commitadas
- **Phase 9 (Polish)**: depende de Phase 8

### Dependências entre user stories

| US | Depende de | Pode rodar em paralelo com |
|---|---|---|
| US1 (gitignore) | — | US2, US3, US4, US7 |
| US2 (README) | — | US1, US3, US4 |
| US3 (OG image) | — | US1, US2, US4, US5 |
| US4 (Sobre) | — | US1, US2, US3 |
| US5 (Home perguntas) | Phase 2 (pergunta field) | US3, US4 (após Phase 2) |
| US6 (Deploy) | Todas as anteriores | — |

### Paralelas dentro de cada fase

- T005, T008, T009, T010, T013 → podem ser executadas simultaneamente (arquivos distintos)
- T017, T018 (Render) → podem rodar em paralelo com T019 (Vercel) se separados por pessoa

---

## Parallel Example: Phase 3 + Phase 4 + Phase 5 juntas

```bash
# Após Phase 1 e Phase 2, iniciar em paralelo:
Tarefa A: T005 + T006 + T007  (US1 — .gitignore)
Tarefa B: T008                 (US2 — README)
Tarefa C: T009                 (US4 — Sobre)
Tarefa D: T013 + T014 + T015   (US3 — OG image)
# US5 aguarda Phase 2 — então T010 + T011 + T012
```

---

## Estratégia de Implementação

### MVP mínimo (apenas P1 antes do deploy)

1. Phase 1: Setup ✓
2. Phase 2: Foundational (pergunta field) ✓
3. Phase 3: US1 (gitignore) ✓
4. Phase 4: US2 (README) ✓
5. **PARAR e validar** → então fazer deploy (Phase 8)

### Entrega completa (recomendada)

1. Phase 1 → Phase 2
2. Phase 3 + 4 + 5 + 7 em paralelo
3. Phase 6 (US5 — home perguntas)
4. Phase 8 (Deploy)
5. Phase 9 (Validação)

---

## Notas

- Sem tarefas de teste (não solicitadas na spec)
- `[P]` = arquivos distintos, sem dependências entre si
- Commitar após cada user story completa, não após cada tarefa individual
- O campo `pergunta` deve ser adicionado ANTES de qualquer trabalho na home (Phase 2 bloqueia US5)
- O URL definitivo do Vercel só é conhecido após T019 — atualizar CORS e README em T020
