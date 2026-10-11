# Data Model: Polimento Pré-Deploy

**Feature**: `006-polimento-pre-deploy` | **Date**: 2026-10-11

## Alteração: tipo `Projeto` em `content/projetos.ts`

Campo adicionado: `pergunta: string` (obrigatório)

```typescript
export type Projeto = {
  slug: string;
  nome: string;
  descricao: string;    // descrição funcional do mini-projeto
  pergunta: string;     // pergunta educacional que o projeto responde
  ed: string;
  cor: CorProjeto;
  disciplinas: Disciplina[];
  textoEd: string;
  operacoes?: string[];
  complexidade?: string;
};
```

### Valores por projeto

| Slug | `pergunta` |
|---|---|
| `pilha` | `"Por que um programa trava com recursão infinita?"` |
| `escalonador` | `"Como o sistema operacional decide qual processo roda agora?"` |
| `roteamento` | `"Como a internet escolhe o melhor caminho para um pacote?"` |
| `graus-de-separacao` | `"Em quantos saltos você chega a qualquer pessoa no LinkedIn?"` |
| `busca-hash` | `"Por que dict['chave'] é mais rápido do que buscar numa lista?"` |
| `indice-bst` | `"Por que criar um índice no banco de dados acelera tanto a query?"` |
| `alocador-memoria` | `"O que é um memory leak e por que ele trava o programa?"` |

## Outros artefatos novos

| Arquivo | Tipo | Conteúdo |
|---|---|---|
| `frontend/public/og.png` | PNG estático | Imagem Open Graph 1200×630 |
| `frontend/public/og.svg` | SVG fonte | Fonte editável da imagem OG |

## Sem alteração de modelo backend

Nenhuma migration Django necessária. Nenhuma estrutura de dados Python alterada.
