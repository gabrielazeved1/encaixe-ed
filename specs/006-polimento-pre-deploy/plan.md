# Implementation Plan: Polimento Pré-Deploy

**Branch**: `006-polimento-pre-deploy` | **Date**: 2026-10-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification de `specs/006-polimento-pre-deploy/spec.md`

## Summary

Ajustes finais antes do deploy em produção: limpeza do repositório (`.specify/` e `.claude/` rastreados indevidamente), README completo, imagem OG estática, remoção de trecho da página Sobre, adição de perguntas contextuais ao lado dos projetos na home, e deploy via Vercel + Render.

## Technical Context

**Language/Version**: TypeScript 5 · Python 3.14.7

**Primary Dependencies**: Next.js 14 (App Router) · Tailwind CSS · Django 5 · DRF

**Storage**: N/A (sem banco de dados relacional; estado stateless)

**Testing**: pytest (backend) · vitest (frontend)

**Target Platform**: Web — Vercel (frontend) · Render (backend)

**Project Type**: Web application (fullstack educacional)

**Performance Goals**: Home carrega em < 3s em conexão padrão (Lighthouse)

**Constraints**: Sem dependências novas fora da stack travada; OG image como arquivo estático (não gerada dinamicamente)

**Scale/Scope**: Site público, sem autenticação, sem sessão persistida

## Constitution Check

| Princípio | Status | Observação |
|---|---|---|
| I. Core-First (módulos Python puros) | ✅ Não impactado | Nenhuma estrutura de dados é alterada nesta feature |
| II. Views Magras | ✅ Não impactado | Nenhuma view Django é alterada |
| III. Tipagem Estrita | ✅ Observado | `pergunta` adicionado ao tipo `Projeto` com type hint obrigatório |
| IV. Teste Antes do Endpoint | ✅ Não impactado | Nenhum endpoint novo |
| V. Separação de Responsabilidades no Frontend | ✅ Observado | `pergunta` vem de `content/projetos.ts`; nenhum fetch novo |
| VI. Stack Travada | ✅ Observado | Nenhuma dependência nova adicionada |

**Gate: PASS** — nenhuma violação. Pode avançar para Phase 1.

## Project Structure

### Documentation (this feature)

```text
specs/006-polimento-pre-deploy/
├── plan.md              ← este arquivo
├── research.md          ← Phase 0 (resolução das perguntas de research)
├── data-model.md        ← Phase 1 (tipo Projeto atualizado)
├── quickstart.md        ← Phase 1 (validação end-to-end)
├── contracts/           ← N/A (sem contrato de API novo)
└── tasks.md             ← Phase 2 (/speckit-tasks)
```

### Source Code (arquivos alterados)

```text
.gitignore                               ← adicionar .specify/ e .claude/

frontend/
  app/
    layout.tsx                           ← adicionar metadata.openGraph com og:image
    page.tsx                             ← adicionar seção de projetos + perguntas
    sobre/page.tsx                       ← remover frase da seção Origem
  content/
    projetos.ts                          ← adicionar campo `pergunta` ao tipo Projeto
                                            e preencher os 7 projetos
  public/
    og.png                               ← imagem OG estática (1200×630)

README.md                               ← reescrever completo
```

## Complexity Tracking

> Nenhuma violação de constituição identificada.

---

## Phase 0: Research

### Decisões resolvidas

**D1 — Arquivos `.specify/` já rastreados pelo git**

- **Decisão**: Executar `git rm --cached` em todos os arquivos de `.specify/` antes de adicionar ao `.gitignore`.
- **Racional**: Os arquivos foram commitados antes de existir a entrada no `.gitignore`. `git rm --cached` remove do índice sem deletar os arquivos localmente.
- **Impacto**: Após o commit de limpeza, o diretório `.specify/` deixa de aparecer no histórico de novos commits. O histórico anterior fica intacto.
- **`.claude/`**: Status atual é `untracked` (`??` no git status inicial) — não precisa de `git rm --cached`, apenas da entrada no `.gitignore`.

**D2 — Campo `pergunta` em `content/projetos.ts`**

- **Decisão**: O tipo `Projeto` não tem campo `pergunta`. Será adicionado como campo obrigatório `string`.
- **Racional**: Centralizar em `content/projetos.ts` segue o Princípio V da constituição. As 7 perguntas serão escritas com base nos mini-projetos já documentados.
- **Perguntas definidas** (derivadas dos `textoEd` e `disciplinas` de cada projeto):

| Slug | Pergunta |
|---|---|
| `pilha` | Por que um programa trava com recursão infinita? |
| `escalonador` | Como o sistema operacional decide qual processo roda agora? |
| `roteamento` | Como a internet escolhe o melhor caminho para um pacote? |
| `graus-de-separacao` | Em quantos saltos você chega a qualquer pessoa no LinkedIn? |
| `busca-hash` | Por que `dict['chave']` é mais rápido do que buscar numa lista? |
| `indice-bst` | Por que criar um índice no banco de dados acelera tanto a query? |
| `alocador-memoria` | O que é um memory leak e por que ele trava o programa? |

**D3 — Posição das perguntas na home**

- **Decisão**: Adicionar nova seção `<section>` entre os feature cards e o card "Adivinhe a Estrutura", exibindo os 7 projetos em lista compacta com o nome do projeto à esquerda e a pergunta contextual à direita/abaixo.
- **Racional**: A seção hero existente (headline + HeroAnimation) e os feature cards já ocupam o espaço "acima do fold" em desktop. Uma seção de projetos com perguntas logo abaixo dos cards fica visível sem scroll em viewports maiores e é acessível com scroll mínimo em mobile.
- **Layout**: grid de 1 coluna no mobile, 1 coluna em tablet, lista linear com `nome` em destaque e `pergunta` em `text-slate-400` menor, linkada para o slug do projeto.

**D4 — Imagem OG**

- **Decisão**: Criar arquivo estático `frontend/public/og.png` (1200×630) usando SVG exportado para PNG ou ferramenta gráfica. Configurar em `layout.tsx` via `metadata.openGraph.images`.
- **Racional**: Geração dinâmica (Next.js `opengraph-image.tsx`) adiciona complexidade. Para v1 um arquivo estático é suficiente e mais rápido de servir.
- **Conteúdo**: Logo "E" + nome "Encaixe" + tagline "Estruturas de Dados em Ação" sobre fundo escuro (`#0d1117`), acento azul (`#3b82f6`).

**D5 — README**

- **Decisão**: Reescrever do zero com seções: descrição, demo (link Vercel), pré-requisitos, setup (backend + frontend), stack em tabela, estrutura de pastas resumida.
- **Racional**: README atual tem 11 linhas e não cobre setup nem link de produção. O "E" como slogan visual fica no site; o README é documento técnico.

**D6 — CORS no backend**

- **Decisão**: Configurar `CORS_ALLOWED_ORIGINS` no `settings.py` do Django com o domínio Vercel. Usar `django-cors-headers` (verificar se já está em `requirements.txt`).
- **Racional**: O frontend em produção fará chamadas cross-origin para o backend no Render. Sem CORS correto, todas as chamadas falham no browser.

---

## Phase 1: Design & Contracts

### Data Model — `data-model.md`

Ver arquivo gerado: [data-model.md](data-model.md)

### Contracts

Não aplicável — nenhum endpoint novo nesta feature. O contrato de API existente não muda.

### Quickstart

Ver arquivo gerado: [quickstart.md](quickstart.md)
