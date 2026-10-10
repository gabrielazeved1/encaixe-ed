# Feature Specification: Modo Step-by-Step nas Visualizações

**Feature Directory**: `specs/002-step-by-step-visualizacoes/`

**Created**: 2026-10-10

**Status**: Draft

**Input**: Adicionar controle de reprodução estilo depurador (play, pause, step forward, step backward, reset, slider de velocidade) às visualizações dos mini-projetos, com barra lateral descrevendo em linguagem natural o passo atual da operação. Primeira entrega cobre pilha, indice_bst e busca_hash; demais projetos virão em iterações posteriores.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pausar e inspecionar um passo intermediário (Priority: P1)

Um estudante inicia uma operação em uma estrutura de dados (ex.: inserir um valor na BST) e, em vez de ver o resultado final em uma única animação, pode pausar a execução, avançar passo a passo e observar como o estado da estrutura muda a cada decisão do algoritmo. Enquanto o estudante avança, uma barra lateral descreve em texto o que está acontecendo (ex.: "comparando chave 42 com nó raiz 30 → desce para a direita"). O destaque visual na estrutura acompanha o passo descrito.

**Why this priority**: é o coração da feature — sem a capacidade de pausar e inspecionar passos intermediários, o modo step-by-step não existe. Entrega sozinho o maior salto educacional do projeto, pois é o que transforma animação decorativa em ferramenta de estudo.

**Independent Test**: executável de ponta a ponta no mini-projeto `indice_bst` (ou `pilha`): o usuário envia uma operação, a visualização entra em pausa no primeiro passo, o usuário clica "próximo" N vezes até concluir, e a cada clique vê (a) o estado da estrutura atualizar e (b) o texto descritivo do passo mudar.

**Acceptance Scenarios**:

1. **Dado** que o estudante acabou de disparar uma operação, **Quando** a visualização inicia no modo step-by-step, **Então** a execução começa pausada no passo 0 e nenhuma mudança visual acontece até o estudante avançar.
2. **Dado** que a execução está pausada em um passo intermediário, **Quando** o estudante clica em "próximo passo", **Então** a visualização avança exatamente um passo e a descrição textual é atualizada para refletir esse passo.
3. **Dado** que o estudante avançou alguns passos manualmente, **Quando** ele clica em "voltar passo", **Então** a visualização retorna ao estado exato do passo anterior (sem reexecutar a operação do início).
4. **Dado** que a execução chegou ao último passo, **Quando** o estudante clica em "próximo", **Então** o botão fica desabilitado e uma indicação de "fim" aparece.

---

### User Story 2 — Reproduzir automaticamente com controle de velocidade (Priority: P2)

O estudante pode optar por ver a operação rodar automaticamente, do início ao fim, em velocidade ajustável. Isso serve tanto para ter uma visão geral rápida ("tocar em 2×") quanto para desacelerar trechos difíceis ("tocar em 0.25×"). Ao clicar em pause, a execução estaciona no passo atual e o usuário pode continuar manualmente.

**Why this priority**: complementa a US1. Sem auto-play, o modo step-by-step existe mas é cansativo para operações longas (ex.: inserir 10 chaves em sequência). Com auto-play ele vira experiência completa de depuração.

**Independent Test**: executável no mesmo mini-projeto da US1 clicando "play" em uma operação já em andamento e observando os passos avançarem sozinhos no ritmo configurado.

**Acceptance Scenarios**:

1. **Dado** que a visualização está pausada em um passo intermediário, **Quando** o estudante clica em "play", **Então** os passos subsequentes são executados automaticamente no intervalo configurado pelo slider de velocidade.
2. **Dado** que a reprodução automática está rodando, **Quando** o estudante move o slider de velocidade, **Então** o próximo intervalo entre passos reflete o novo valor imediatamente, sem precisar pausar.
3. **Dado** que a reprodução automática está rodando, **Quando** o estudante clica em "pause", **Então** a execução para no passo em curso e permanece inspecionável.
4. **Dado** que a operação terminou, **Quando** o estudante clica em "reset", **Então** o estado volta ao passo 0 (estrutura como estava antes da operação) e o painel de controles é reinicializado.

---

### User Story 3 — Entender o passo atual em linguagem natural (Priority: P1)

A cada passo da operação, uma barra lateral mostra em uma a duas frases o que o algoritmo está fazendo naquele instante — por que comparou duas chaves, por que escolheu descer para a direita, por que precisou rebalancear. Os elementos relevantes no passo (ex.: os dois nós sendo comparados) ficam destacados visualmente em sincronia com a descrição.

**Why this priority**: é a outra metade do valor educacional. Avançar passo a passo sem explicação textual exige que o estudante já saiba o algoritmo. Com a narrativa textual, o site ensina em vez de só exibir. Priorizado como P1 junto da US1 porque uma sem a outra não entrega o valor pedagógico pretendido.

**Independent Test**: durante uma execução passo a passo no `indice_bst`, para cada passo o painel lateral apresenta uma frase não-vazia descrevendo o passo, e pelo menos um elemento da visualização aparece em destaque correspondente.

**Acceptance Scenarios**:

1. **Dado** que a visualização está em qualquer passo intermediário, **Quando** o estudante olha para a barra lateral, **Então** vê uma descrição textual do passo atual com no mínimo um elemento visual destacado na estrutura.
2. **Dado** que o passo atual envolve comparação entre dois elementos, **Quando** a descrição menciona esses elementos, **Então** ambos ficam visualmente destacados simultaneamente na estrutura.
3. **Dado** que o passo atual é o estado inicial (passo 0), **Quando** o estudante olha para a barra lateral, **Então** a descrição informa claramente que nenhuma operação foi executada ainda.

---

### Edge Cases

- O que acontece se uma operação é instantânea (zero ou um passo), como `peek()` em pilha? → A linha do tempo mostra um único passo "resultado" com descrição textual; controles de step forward/backward ficam limitados a esse estado.
- O que acontece se o estudante dispara uma segunda operação enquanto a reprodução anterior ainda está em curso? → A reprodução em curso é cancelada e uma nova linha do tempo substitui a anterior, começando pausada no passo 0.
- O que acontece quando a barra lateral descreve um passo cujo elemento destacado deixou de existir (ex.: nó removido num passo posterior)? → O destaque segue apenas enquanto o passo que o referencia estiver ativo; ao avançar, o destaque muda para os elementos do novo passo.
- O que acontece se o backend retornar uma lista vazia de passos? → A visualização mostra o estado final sem controles de step (ou com controles desabilitados) e uma mensagem indicando que a operação não produziu passos intermediários.
- O que acontece em telas pequenas (mobile)? → Controles de reprodução permanecem acessíveis; a barra lateral vira painel colapsável abaixo da visualização.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O backend DEVE expor, para cada operação suportada, uma sequência ordenada de passos onde cada passo contém o estado completo da estrutura naquele instante e uma descrição textual em português (pt-BR) do que o algoritmo está fazendo.
- **FR-002**: Cada passo DEVE poder ser identificado por um índice numérico sequencial (0 a N-1) para suportar navegação direta.
- **FR-003**: Cada passo DEVE incluir uma lista (possivelmente vazia) de identificadores de elementos que devem ser destacados visualmente nesse passo (ex.: índices de nós comparados, posição de bucket em colisão).
- **FR-004**: A interface DEVE oferecer controles de "play", "pause", "próximo passo", "passo anterior" e "reset" visíveis ao usuário em todas as visualizações que suportem o modo.
- **FR-005**: A interface DEVE oferecer um controle de velocidade (slider ou botões discretos) com no mínimo três opções perceptivelmente distintas (ex.: 0.5×, 1×, 2×).
- **FR-006**: A navegação para trás (passo anterior) DEVE restaurar o estado exato do passo anterior sem reexecutar a operação, usando os estados pré-calculados retornados pelo backend.
- **FR-007**: A interface DEVE exibir, em uma área dedicada e sempre visível durante a execução, a descrição textual do passo atual em pt-BR.
- **FR-008**: O destaque visual na estrutura DEVE estar sincronizado com a descrição textual: ao avançar/retroceder um passo, o conjunto de elementos destacados é atualizado atomicamente junto com o texto.
- **FR-009**: Quando a reprodução automática atinge o último passo, a interface DEVE parar automaticamente e indicar visualmente o fim da sequência.
- **FR-010**: Disparar uma nova operação enquanto uma sequência está sendo reproduzida DEVE cancelar a sequência atual e substituí-la pela nova, começando pausada no passo 0.
- **FR-011**: A feature DEVE estar inicialmente integrada aos mini-projetos `pilha`, `indice_bst` e `busca_hash`. Os demais mini-projetos permanecem com a animação atual até iteração futura.
- **FR-012**: O modo step-by-step DEVE ser o modo padrão nos três projetos integrados; não há toggle para "modo clássico/sem passos" na primeira entrega.
- **FR-013**: Uma operação sem passos intermediários (ex.: `peek()` em pilha vazia) DEVE ser representada como uma sequência de exatamente um passo descritivo, mantendo o contrato uniforme com operações mais longas.

### Key Entities

- **PassoDeOperacao**: Representa um instante discreto durante a execução de uma operação. Possui um índice sequencial, uma descrição textual em pt-BR, uma lista de identificadores de elementos a destacar e uma representação do estado da estrutura naquele instante (formato específico por tipo de estrutura — array de valores para pilha, árvore serializada para BST, buckets para hash).
- **SequênciaDeExecução**: Coleção ordenada de PassoDeOperacao retornada pelo backend em resposta a uma operação. Carrega metadados de contexto (nome da operação, entrada original) para apresentação na UI.
- **EstadoDeReprodução**: Estado efêmero mantido no frontend durante a visualização — índice atual, se está tocando ou pausado, velocidade selecionada. Não é persistido entre sessões.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em cada um dos três mini-projetos integrados (`pilha`, `indice_bst`, `busca_hash`), o estudante consegue executar uma operação não-trivial e percorrer todos os seus passos intermediários sem precisar reiniciar a operação para ver um passo que já passou.
- **SC-002**: Para toda operação típica dos três projetos integrados, 100% dos passos exibidos têm descrição textual não-vazia em pt-BR.
- **SC-003**: O tempo entre o clique em "próximo passo" e a atualização visível da estrutura e do texto é imperceptível ao usuário (abaixo do limiar de percepção de latência em interface interativa).
- **SC-004**: Alternar a velocidade de reprodução durante o auto-play produz efeito perceptível no intervalo entre passos no próximo passo executado, sem necessidade de pausar e dar play novamente.
- **SC-005**: Um estudante que nunca viu o conceito de BST consegue, ao percorrer passo a passo uma inserção, identificar em qual ponto o algoritmo escolhe "descer para a esquerda ou direita" baseado apenas no que vê e lê na tela.

## Assumptions

- Os três mini-projetos cobertos nesta feature (`pilha`, `indice_bst`, `busca_hash`) são aqueles cujo valor pedagógico mais depende dos passos intermediários; os demais projetos receberão o modo em iteração futura e seguem funcionando no modo atual até lá.
- As descrições textuais dos passos são geradas no backend junto com os estados — o frontend não interpreta nem compõe texto a partir do estado bruto.
- O backend retorna a sequência completa de passos em uma única resposta por operação; não há streaming nem paginação de passos.
- O estado completo da estrutura é pequeno o suficiente, para as entradas típicas do site, para ser enviado em cada passo sem compactação ou diff — otimizações só serão consideradas se virar gargalo real.
- O modo é desktop-first; mobile funciona mas o layout da barra lateral pode ser adaptado (colapsável/abaixo da visualização) sem comprometer a feature.
- A UI apresenta todos os textos em pt-BR, consistente com o restante do site.
- Nenhum requisito de acessibilidade avançada (leitor de tela, navegação por teclado completa dos controles) está no escopo da primeira entrega — ficam como melhoria futura.
