# Encaixe — Constituição do Projeto

## Core Principles

### I. Core-First (Módulos Python Puros)

Todo código de estrutura de dados DEVE residir em `backend/core/estruturas/` como módulos
Python puro — sem nenhum `import` de Django, DRF ou qualquer framework. Cada módulo
DEVE ser importável e testável com `pytest` sem iniciar o servidor Django.

O mesmo módulo DEVE ser reutilizado por múltiplos apps quando aplicável
(ex.: o `Heap` compartilhado por `escalonador` e `roteamento`).

### II. Views Magras (NÃO-NEGOCIÁVEL)

Views Django DEVEM fazer exatamente três coisas — nada mais:

1. Validar entrada via `serializers.py`
2. Chamar a função correspondente em `core/estruturas/`
3. Retornar o resultado como JSON

Qualquer lógica de estrutura de dados dentro de uma view é uma violação imediata deste
princípio. Uma view que ultrapassa ~20 linhas é um sinal de alerta.

### III. Tipagem Estrita

- **TypeScript:** `strict: true` no `tsconfig.json` sem exceções. Uso de `any` é proibido
  salvo com justificativa explícita em comentário.
- **Python:** type hints em toda assinatura de função e classe pública em `core/estruturas/`.
  Sem `# type: ignore` sem justificativa documentada.

### IV. Teste Antes do Endpoint

Cada estrutura em `core/estruturas/` DEVE ter testes `pytest` unitários aprovados antes
de seu endpoint Django ser escrito. Cada endpoint DEVE ter testes de integração aprovados
antes de ser consumido pelo frontend.

Ordem inegociável: **estrutura pura → testes unitários → endpoint → testes de integração → frontend**.

### V. Separação de Responsabilidades no Frontend

- Componentes de UI NUNCA fazem fetch. Cada mini-projeto tem exatamente um hook
  (`use<Nome>`) responsável por toda comunicação HTTP.
- `lib/api.ts` é o único ponto de entrada para chamadas HTTP no frontend.
  Nenhum componente importa `fetch` diretamente.
- Textos educacionais e metadados dos 7 projetos ficam exclusivamente em
  `content/projetos.ts` — nunca inline em componentes.

### VI. Stack Travada

A stack abaixo é definitiva para a v1. Nenhuma dependência fora desta lista é adicionada
sem discussão explícita e atualização da spec:

| Camada   | Tecnologia                                         |
| -------- | -------------------------------------------------- |
| Frontend | Next.js 14+ App Router · TypeScript · Tailwind CSS |
| Backend  | Django 5+ · Django REST Framework                  |
| Testes   | pytest (backend) · vitest (frontend)               |
| Python   | 3.14.7 via pyenv                                   |
| Deploy   | Vercel (frontend) · Render (backend)               |

## Restrições de Infraestrutura

- **Sem autenticação:** o site é público. Nenhum sistema de login ou controle de acesso
  deve ser implementado na v1.
- **Sem persistência entre sessões:** nenhum dado de usuário é salvo entre requisições.
  Cada chamada de API é stateless.
- **Um endpoint por mini-projeto:** cada um dos 7 projetos expõe exatamente um endpoint
  REST (POST). Endpoints adicionais exigem justificativa na spec.
- **Sem banco de dados relacional:** nenhuma migration Django é necessária. Toda lógica
  opera sobre dados enviados na requisição.

## Workflow de Desenvolvimento

Este projeto usa Spec Kit para desenvolvimento orientado por especificação.
A sequência DEVE ser seguida para cada um dos 7 mini-projetos:

```text
/speckit-specify    → define O QUÊ e POR QUÊ (sem implementação)
/speckit-plan       → plano técnico revisável
/speckit-tasks      → tarefas pequenas e revisáveis
/speckit-implement  → código tarefa por tarefa
/speckit-converge   → valida e registra o que falta
```

Commits seguem o formato `tipo(escopo): descrição` em português, imperativo,
sem atribuição ao assistente.

## Governance

Esta constituição tem precedência sobre qualquer outra prática ou preferência local.

**Emendas:** qualquer alteração a um princípio existente requer:

1. Justificativa documentada no PR
2. Atualização deste arquivo via `/speckit-constitution`
3. Atualização do `CLAUDE.md` se o princípio estiver espelhado lá

**Versionamento semântico:**

- MAJOR — remoção ou redefinição incompatível de um princípio
- MINOR — novo princípio ou seção adicionada
- PATCH — clarificações, correções de redação

**Conformidade:** todo PR DEVE verificar aderência aos Princípios I–VI antes do merge.
O arquivo de referência de runtime para o Claude Code é `CLAUDE.md`.

**Version**: 1.0.0 | **Ratified**: 2026-09-12 | **Last Amended**: 2026-09-12
