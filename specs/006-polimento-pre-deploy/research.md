# Research: Polimento Pré-Deploy

**Feature**: `006-polimento-pre-deploy` | **Date**: 2026-10-11

## D1 — Arquivos `.specify/` já rastreados pelo git

- **Decisão**: `git rm --cached -r .specify/` + adicionar `.specify/` ao `.gitignore` raiz.
- **Racional**: Arquivos foram commitados antes da entrada existir no `.gitignore`. O comando remove do índice sem apagar localmente.
- **`.claude/`**: já é `untracked` — só precisa da entrada no `.gitignore`.
- **Alternativa rejeitada**: reescrever o histórico com `git filter-branch` — desnecessário para tooling interno, não vale a disrupção.

## D2 — Campo `pergunta` em `content/projetos.ts`

- **Decisão**: Adicionar `pergunta: string` como campo obrigatório no tipo `Projeto`.
- **Perguntas**:

| Slug | Pergunta |
|---|---|
| `pilha` | Por que um programa trava com recursão infinita? |
| `escalonador` | Como o sistema operacional decide qual processo roda agora? |
| `roteamento` | Como a internet escolhe o melhor caminho para um pacote? |
| `graus-de-separacao` | Em quantos saltos você chega a qualquer pessoa no LinkedIn? |
| `busca-hash` | Por que `dict['chave']` é mais rápido do que buscar numa lista? |
| `indice-bst` | Por que criar um índice no banco de dados acelera tanto a query? |
| `alocador-memoria` | O que é um memory leak e por que ele trava o programa? |

- **Alternativa rejeitada**: usar `descricao` existente como pergunta — o `descricao` descreve o projeto, não faz a pergunta educacional.

## D3 — Posição das perguntas na home

- **Decisão**: Nova `<section>` entre os feature cards e o card "Adivinhe a Estrutura". Lista dos 7 projetos com nome + pergunta, cada item linkado para `/projetos/[slug]`.
- **Racional**: Hero + feature cards já ocupam o topo; inserir logo abaixo garante visibilidade sem reorganizar o layout existente.
- **Alternativa rejeitada**: colocar dentro do hero (reorganiza o layout atual, quebra o equilíbrio visual com a HeroAnimation).

## D4 — Imagem OG

- **Decisão**: Arquivo estático `frontend/public/og.png` (1200×630). Configurado em `layout.tsx` via `metadata.openGraph`.
- **Racional**: Geração dinâmica (`opengraph-image.tsx`) adiciona complexidade desnecessária para v1.
- **Conteúdo visual**: fundo `#0d1117`, "E" grande em azul `#3b82f6`, "Encaixe" em branco, tagline em cinza.
- **Alternativa rejeitada**: `opengraph-image.tsx` com Satori — válido para v2.

## D5 — CORS

- **Decisão**: Verificar se `django-cors-headers` já está em `requirements.txt`; se não, adicionar. Configurar `CORS_ALLOWED_ORIGINS` com o domínio Vercel de produção.
- **Variável de ambiente sugerida**: `CORS_ALLOWED_ORIGINS` via variável de ambiente no Render para não hardcodar o domínio.
