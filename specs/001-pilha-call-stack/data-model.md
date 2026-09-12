# Data Model: Visualizador de Pilha de Chamadas

**Phase 1 — Entidades e relacionamentos**
**Date**: 2026-09-12

## Entidades

### Frame

Representa uma invocação de função presente na pilha em determinado momento.

| Campo          | Tipo            | Obrigatório | Descrição                                      |
| -------------- | --------------- | ----------- | ---------------------------------------------- |
| `nome_funcao`  | string          | sim         | Nome da função chamada (`"fatorial"`, `"fibonacci"`) |
| `argumento`    | integer         | sim         | Valor recebido por esta chamada                |
| `retorno`      | integer \| null | não         | Valor retornado; presente apenas após o pop    |
| `profundidade` | integer (≥ 1)   | sim         | Posição na pilha (1 = base)                    |

### Evento

Acontecimento atômico no ciclo de vida da pilha durante uma simulação.

| Campo          | Tipo                          | Obrigatório | Descrição                                        |
| -------------- | ----------------------------- | ----------- | ------------------------------------------------ |
| `tipo`         | enum: push / pop / overflow   | sim         | Natureza do evento                               |
| `frame`        | Frame                         | sim         | Frame que originou o evento                      |
| `pilha_estado` | Frame[]                       | sim         | Snapshot completo da pilha após este evento      |

**Regras de consistência:**

- `tipo = "push"` → `frame.retorno` é `null`
- `tipo = "pop"` → `frame.retorno` é o valor calculado nesta chamada
- `tipo = "overflow"` → `frame.retorno` é `null`; `pilha_estado` contém o último
  estado antes do estouro

### Simulação

Resultado completo de uma execução.

| Campo    | Tipo                       | Obrigatório | Descrição                                      |
| -------- | -------------------------- | ----------- | ---------------------------------------------- |
| `funcao` | enum: fatorial / fibonacci | sim         | Função simulada                                |
| `valor`  | integer (≥ 1)              | sim         | Argumento de entrada                           |
| `status` | enum: completo / overflow  | sim         | Desfecho da simulação                          |
| `frames` | Evento[]                   | sim         | Sequência ordenada de eventos                  |

**Invariantes:**

- `frames` nunca é vazio (toda simulação tem ao menos um evento push).
- Se `status = "overflow"`, o último item de `frames` tem `tipo = "overflow"`.
- Se `status = "completo"`, o número de eventos `push` é igual ao número de `pop`.
- `pilha_estado` em cada evento reflete o estado **após** o evento ser processado.

## Validação de entrada

| Campo    | Regra                                       | Erro                                      |
| -------- | ------------------------------------------- | ----------------------------------------- |
| `funcao` | Deve ser `"fatorial"` ou `"fibonacci"`      | `"Função inválida"`                       |
| `valor`  | Inteiro, ≥ 1                                | `"Valor deve ser um inteiro positivo"`    |
| `valor`  | Não pode ser string, float ou valor ausente | `"Tipo inválido para o campo valor"`      |
