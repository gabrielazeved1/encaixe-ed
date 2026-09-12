# Feature Specification: Visualizador de Pilha de Chamadas

**Feature Branch**: `001-pilha-call-stack`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "pilha — Visualizador de pilha de chamadas"

## User Scenarios & Testing

### User Story 1 — Visualizar execução recursiva passo a passo (Priority: P1)

O usuário escolhe uma função recursiva (fatorial ou Fibonacci) e informa um valor de
entrada. O sistema executa a função e devolve a sequência completa de eventos da pilha
de chamadas — cada chamada empilhando um novo frame, cada retorno desempilhando o mais
recente. O usuário vê a pilha crescer e encolher quadro a quadro, entendendo como a
recursão funciona na prática.

**Why this priority**: É a demonstração central do mini-projeto. Sem ela, nada mais faz
sentido. Entrega o valor educativo principal: tornar visível o que o processador faz
internamente ao executar uma função recursiva.

**Independent Test**: Pode ser testado completamente ao escolher "fatorial" com valor 4
e verificar que a sequência de frames exibidos reflete exatamente as 4 chamadas
recursivas (fatorial(4) → fatorial(3) → fatorial(2) → fatorial(1)) seguidas dos 4
retornos em ordem inversa.

**Acceptance Scenarios**:

1. **Given** o usuário selecionou "fatorial" e informou o valor 4,
   **When** submete a simulação,
   **Then** o sistema retorna 8 eventos (4 push + 4 pop) refletindo cada chamada e cada
   retorno da recursão, na ordem correta.

2. **Given** o usuário selecionou "Fibonacci" e informou o valor 5,
   **When** submete a simulação,
   **Then** o sistema retorna os frames correspondentes à árvore de chamadas do
   Fibonacci(5), incluindo todas as chamadas duplicadas, evidenciando a ineficiência
   da recursão ingênua.

3. **Given** os frames foram retornados,
   **When** o usuário observa a animação,
   **Then** cada push mostra o frame sendo adicionado ao topo da pilha e cada pop mostra
   o frame sendo removido, com o valor de retorno exibido no momento do pop.

---

### User Story 2 — Observar estouro de pilha (Priority: P2)

O usuário informa um valor de entrada grande o suficiente para causar estouro de pilha.
O sistema detecta o limite, interrompe a simulação no ponto de ruptura e exibe o estado
da pilha no momento do estouro — tornando concreto o conceito de "stack overflow".

**Why this priority**: O estouro de pilha é um dos erros mais comuns em programação
recursiva. Ver ele acontecer de forma controlada e explicada transforma um erro opaco em
um conceito compreensível.

**Independent Test**: Pode ser testado ao informar um valor muito alto (ex.: 1000) e
verificar que o sistema exibe o estado da pilha no momento do estouro com uma mensagem
clara, sem travar ou retornar erro genérico.

**Acceptance Scenarios**:

1. **Given** o usuário informou um valor que excede o limite de profundidade suportado,
   **When** submete a simulação,
   **Then** o sistema retorna os frames acumulados até o ponto de estouro mais um evento
   de overflow identificado, indicando que a pilha ultrapassou sua capacidade.

2. **Given** o sistema detectou estouro,
   **When** a animação exibe o resultado,
   **Then** o estado final da pilha (cheia, no limite) é visível, e uma sinalização
   clara indica o motivo da interrupção.

---

### User Story 3 — Compreender o conceito e a conexão com as disciplinas (Priority: P3)

Após interagir com a demonstração, o usuário lê a explicação sobre a estrutura Pilha
(Stack) e entende por que essa estrutura aparece em Arquitetura de Computadores e em
Sistemas Operacionais.

**Why this priority**: A componente educativa é o diferencial do site em relação a
qualquer visualizador genérico. Mas depende das histórias P1 e P2 para ter contexto —
a explicação ganha sentido depois de ver a demonstração.

**Independent Test**: Pode ser testado verificando que a página exibe a seção "Sobre
esta estrutura" com conteúdo sobre LIFO e a seção "Onde isso aparece na faculdade" com
referências a Arquitetura de Computadores e Sistemas Operacionais.

**Acceptance Scenarios**:

1. **Given** o usuário está na página do mini-projeto Pilha,
   **When** rola a página abaixo da demonstração,
   **Then** encontra uma explicação sobre o que é uma pilha LIFO, por que a recursão
   depende dela, e o que é stack overflow.

2. **Given** o usuário leu a explicação,
   **When** visualiza a seção de disciplinas relacionadas,
   **Then** vê referências a Arquitetura de Computadores (pilha de chamadas do
   processador) e Sistemas Operacionais (gerenciamento de pilhas por processo).

---

### Edge Cases

- O que acontece se o valor informado for 0 ou negativo?
  → A simulação retorna um único frame (caso base imediato) ou rejeita a entrada com
  mensagem explicativa, sem lançar erro genérico.
- O que acontece se o valor for não-numérico ou em branco?
  → A entrada é rejeitada antes da simulação com mensagem clara ao usuário.
- Fibonacci com valores maiores gera árvore de chamadas exponencial — o sistema
  impõe um limite prático de profundidade/quantidade de frames para não travar a
  animação.

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE aceitar como entrada a escolha de uma função recursiva
  dentre as opções disponíveis (fatorial, Fibonacci).
- **FR-002**: O sistema DEVE aceitar um valor numérico inteiro positivo como parâmetro
  da função escolhida.
- **FR-003**: O sistema DEVE rejeitar entradas inválidas (valor negativo, zero onde
  não aplicável, não-numérico) com mensagem compreensível antes de executar a simulação.
- **FR-004**: O sistema DEVE retornar a sequência completa e ordenada de eventos da
  pilha — cada evento classificado como `push` (chamada) ou `pop` (retorno), com o
  estado da pilha após cada evento.
- **FR-005**: Cada frame DEVE conter: nome da função, argumento recebido e, no momento
  do pop, o valor retornado.
- **FR-006**: O sistema DEVE detectar estouro de pilha e retornar os frames acumulados
  até o ponto de ruptura, sinalizando o tipo de encerramento (completo ou overflow).
- **FR-007**: A demonstração DEVE ser stateless — cada requisição é independente, sem
  armazenar histórico entre sessões.

### Key Entities

- **Frame**: unidade atômica da pilha de chamadas — representa uma invocação de função.
  Atributos: função chamada, argumento, valor de retorno (presente apenas no pop), índice
  de posição na pilha.
- **Evento**: acontecimento no ciclo de vida da pilha — tipo (push/pop/overflow),
  frame associado, estado completo da pilha após o evento.
- **Simulação**: resultado completo de uma execução — lista ordenada de eventos e flag
  indicando se terminou normalmente ou por overflow.

## Success Criteria

### Measurable Outcomes

- **SC-001**: O usuário recebe o resultado da simulação em menos de 2 segundos após
  submeter o formulário (para entradas dentro do limite normal).
- **SC-002**: A animação exibe corretamente 100% dos eventos (push e pop) retornados
  pela simulação, na ordem exata.
- **SC-003**: Estouro de pilha é detectado e sinalizado de forma visualmente distinta
  em 100% dos casos em que ocorre.
- **SC-004**: Entradas inválidas são rejeitadas antes da chamada ao servidor em 100%
  dos casos, sem causar erro não tratado.
- **SC-005**: A página exibe as seções educativas (conceito + disciplinas) completas
  e legíveis em qualquer resolução de tela comum (desktop e mobile).

## Assumptions

- Apenas fatorial e Fibonacci estão no escopo da v1; outras funções recursivas são
  extensão futura.
- O limite de profundidade de pilha para demonstração de overflow não é configurável
  pelo usuário — o sistema define um valor fixo adequado à visualização.
- A animação é controlada pelo frontend com base nos frames recebidos; o servidor
  não tem estado de animação.
- O site é público e não requer autenticação para acessar qualquer mini-projeto.
- Suporte a mobile é desejável mas não é critério de aceite da v1 (desktop é o foco
  primário para o portfólio).
