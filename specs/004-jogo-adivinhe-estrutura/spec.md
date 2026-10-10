# Feature Specification: Jogo "Adivinhe a Estrutura"

**Feature Branch**: `004-jogo-adivinhe-estrutura`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: jogo em que o aluno vê os passos de uma operação sobre uma das 7 estruturas de dados do Encaixe, sem rótulo da estrutura, e precisa adivinhar qual é — a mecânica (ordem de acesso, caminho de busca, trocas pai/filho, bucket probing, etc.) é a única pista.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogar uma rodada e receber veredito (Priority: P1)

O aluno abre a página do jogo, vê a animação passo a passo de uma operação sobre uma estrutura desconhecida, escolhe entre 7 opções qual estrutura acha que está sendo demonstrada e recebe imediatamente o veredito (acertou/errou), a resposta correta e uma explicação curta da mecânica que denunciou a estrutura.

**Why this priority**: é o loop completo mínimo do jogo. Sem isso não há feature; com isso, qualquer outra adição é melhoria incremental.

**Independent Test**: abrir `/adivinhe` em um navegador local, assistir aos passos, clicar em um dos 7 botões e verificar que a tela mostra: (a) se acertou ou errou, (b) o nome da estrutura correta, (c) uma frase explicando por que aquela sequência de passos é típica daquela estrutura.

**Acceptance Scenarios**:

1. **Given** o aluno acessa `/adivinhe` pela primeira vez, **When** a página termina de carregar, **Then** uma rodada já está disponível com pelo menos 1 passo renderizado e 7 botões de palpite visíveis, sem nenhuma menção ao nome da estrutura sorteada em nenhum lugar da tela.
2. **Given** uma rodada carregada, **When** o aluno clica no botão correspondente à estrutura usada, **Then** a tela exibe "Acertou", o nome da estrutura e uma explicação da mecânica.
3. **Given** uma rodada carregada, **When** o aluno clica em um botão que não corresponde à estrutura usada, **Then** a tela exibe "Errou", mostra qual era a estrutura correta e explica por que a mecânica apontava para ela.
4. **Given** a rodada já foi respondida, **When** o aluno tenta responder novamente, **Then** o mesmo veredito é mostrado (resposta idempotente) sem alterar o estado da rodada.

---

### User Story 2 - Trocar de rodada sem recarregar a página (Priority: P2)

Depois de ver o veredito, o aluno quer jogar de novo imediatamente. Ao clicar em "Próxima", uma nova rodada aparece no mesmo lugar — passos novos, 7 botões voltam habilitados, veredito some.

**Why this priority**: sem isso, o jogo é tedioso (reload entre rodadas quebra o fluxo). Mas o loop central já funciona com US1, então é P2.

**Independent Test**: terminar uma rodada (acertando ou errando), clicar em "Próxima" e verificar que uma nova rodada aparece sem recarregar a página, com passos diferentes e botões habilitados novamente.

**Acceptance Scenarios**:

1. **Given** uma rodada respondida com veredito visível, **When** o aluno clica em "Próxima", **Then** uma nova rodada é carregada no mesmo lugar da tela, os botões de palpite voltam a ficar clicáveis e o veredito anterior desaparece.
2. **Given** o aluno jogou 10 rodadas consecutivas via botão "Próxima", **When** inspeciona o histórico de navegação, **Then** nenhuma mudança de URL ocorreu entre rodadas.

---

### User Story 3 - Reproduzir uma rodada específica via semente (Priority: P3)

Um aluno quer compartilhar uma rodada interessante com um colega, ou revisitar aquela rodada em que errou, usando uma URL. Acessar `/adivinhe?seed=42` carrega sempre a mesma estrutura, mesma operação e mesmos valores.

**Why this priority**: aumenta valor pedagógico (compartilhar, revisar) mas não é bloqueador para jogar. P3.

**Independent Test**: abrir `/adivinhe?seed=42`, anotar os passos exibidos; recarregar a página na mesma URL e verificar que os passos são idênticos aos anotados. Abrir em outra máquina com a mesma seed e observar a mesma rodada.

**Acceptance Scenarios**:

1. **Given** o aluno acessa `/adivinhe?seed=42`, **When** compara com um segundo acesso à mesma URL (mesmo navegador ou outro), **Then** a estrutura sorteada, a operação, os valores e a sequência de passos são bit-a-bit idênticos.
2. **Given** o aluno acessa `/adivinhe` (sem seed), **When** recarrega a página, **Then** cada acesso pode mostrar uma rodada diferente (sorteio aleatório).

---

### User Story 4 - Chegar ao jogo a partir da home (Priority: P3)

O aluno que entra em `/` precisa descobrir o jogo. Uma chamada visível na home (card, botão ou link no menu) leva para `/adivinhe`.

**Why this priority**: discoverability. Importante para adoção mas não bloqueia quem já conhece a URL.

**Independent Test**: visitar `/`, localizar um elemento de UI que mencione explicitamente "jogo", "adivinhe" ou equivalente, clicar nele e verificar que a navegação leva a `/adivinhe`.

**Acceptance Scenarios**:

1. **Given** o aluno acessa a home, **When** olha para a tela sem rolar além do primeiro scroll, **Then** existe um elemento clicável que anuncia o jogo e leva para `/adivinhe`.

---

### Edge Cases

- **Rodada expirada**: o aluno abre uma rodada, fica fora 2 horas e volta para responder. O servidor não lembra mais da rodada → o veredito deve retornar uma mensagem clara ("essa rodada expirou, clique em Próxima para começar outra") sem travar a página.
- **Palpite inválido**: cliente envia um valor de palpite fora das 7 estruturas conhecidas → resposta de erro clara, tela não trava, rodada permanece válida para novo palpite.
- **Operação com um só passo visível**: o backend garante que toda rodada tem pelo menos 2 passos (uma operação sorteada que renda apenas 1 passo seria descartada e re-sorteada), para que a mecânica seja observável.
- **Vazamento de nome**: se qualquer descrição ou destaque emitido pelo backend contiver as substrings "pilha", "fila", "heap", "hash", "bst", "linkedlist", "lista encadeada", "grafo" (case-insensitive), a rodada é inválida e deve ser rejeitada antes de chegar ao cliente.
- **Múltiplos palpites na mesma rodada**: aceito; backend retorna sempre o mesmo veredito. Não há "pontuação" ou "tentativas restantes" em v1.
- **Rodada sem passos retornáveis** (bug hipotético): o backend retorna erro 500 em vez de uma rodada vazia; o cliente mostra uma mensagem genérica e um botão "Tentar outra".

## Requirements *(mandatory)*

### Functional Requirements

**Sorteio e geração de rodada**

- **FR-001**: O sistema MUST sortear, a cada nova rodada, uma estrutura entre as 7 do Encaixe (Pilha, Fila, Heap, Hash, BST, LinkedList, Grafo) e uma operação válida para essa estrutura.
- **FR-002**: O sistema MUST executar a operação sorteada contra a implementação pura real da estrutura em `backend/core/estruturas/`, sem instrumentação ad hoc — a mesma função que o endpoint de produção usaria.
- **FR-003**: O sistema MUST retornar ao cliente, para cada rodada, exatamente dois dados: um identificador opaco da rodada e a lista ordenada de passos capturada pela operação.
- **FR-004**: O sistema MUST aceitar uma semente opcional (via querystring); com a mesma semente, duas chamadas MUST produzir a mesma estrutura, operação, valores e passos.
- **FR-005**: O sistema MUST garantir que cada rodada entregue ao cliente tenha pelo menos 2 passos observáveis; rodadas que não atendem esse limite devem ser re-sorteadas antes do retorno.

**Neutralidade dos passos**

- **FR-006**: Nenhum campo de qualquer passo entregue ao cliente (descrição, destaques, estado) MAY conter o nome da estrutura usada ou sinônimos reconhecíveis (lista proibida mínima: "pilha", "fila", "heap", "hash", "bst", "árvore", "linkedlist", "lista encadeada", "grafo"), em qualquer caixa.
- **FR-007**: Destaques e descrições devem usar termos genéricos de mecânica ("topo", "início", "fim", "nó", "elemento", "bucket", "pai", "filho", "aresta", "distância") — esses termos SÃO a pista do jogo e devem permanecer.

**Veredito**

- **FR-008**: Dado um identificador de rodada válido e um palpite entre as 7 estruturas, o sistema MUST retornar: (a) booleano acertou/errou, (b) o nome da estrutura correta, (c) uma explicação em português sobre qual mecânica da operação denuncia a estrutura.
- **FR-009**: Palpites repetidos sobre a mesma rodada MUST ser idempotentes (mesma resposta, nenhum efeito colateral).
- **FR-010**: Palpites com estrutura desconhecida MUST retornar erro de validação sem alterar o estado da rodada.

**Expiração e estado efêmero**

- **FR-011**: O sistema MUST manter em memória o mapeamento entre identificador de rodada e estrutura correta pelo tempo necessário para o aluno responder, com um tempo de vida mínimo de 1 hora.
- **FR-012**: Após o tempo de vida expirar, o palpite correspondente MUST retornar um erro específico de "rodada expirada" sem derrubar o servidor.

**Interface do jogo**

- **FR-013**: A página do jogo MUST exibir, para cada rodada: a área de passos (com controles play/pause/avançar/voltar), 7 botões de palpite claramente rotulados com os nomes das 7 estruturas, e um placeholder para o veredito.
- **FR-014**: Enquanto o aluno não palpitou, nenhuma pista textual sobre a estrutura correta MAY aparecer na tela.
- **FR-015**: Depois do palpite, o veredito MUST aparecer sem recarregar a página; os 7 botões ficam desabilitados ou visualmente marcados.
- **FR-016**: Um botão "Próxima" MUST estar visível depois do veredito e, ao ser clicado, carregar uma nova rodada no mesmo lugar sem navegar para outra URL.

**Descoberta**

- **FR-017**: A home do site MUST exibir um ponto de entrada claro para o jogo, levando para `/adivinhe`.

### Key Entities *(include if feature involves data)*

- **Rodada**: um sorteio específico (estrutura + operação + valores + sequência de passos resultante). Vive em memória pelo tempo de vida definido. Identificada por um token opaco gerado no backend.
- **Palpite**: a resposta do aluno (uma das 7 estruturas conhecidas) para uma rodada específica.
- **Veredito**: o resultado da avaliação de um palpite (acertou/errou, estrutura correta, explicação textual da mecânica).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma bateria manual de 10 rodadas aleatórias (sem seed), o veredito retornado identifica corretamente a estrutura usada em 10 de 10 casos.
- **SC-002**: Uma varredura automatizada dos passos de 50 rodadas sorteadas não encontra, em nenhum campo visível ao cliente, as substrings proibidas listadas em FR-006.
- **SC-003**: Em condições locais de desenvolvimento, a primeira rodada carrega em menos de 300 ms desde o clique até o primeiro passo renderizado.
- **SC-004**: O botão "Próxima" carrega uma nova rodada em menos de 300 ms sem acionar reload da página (URL permanece estável durante toda a sessão de jogo).
- **SC-005**: Duas chamadas a `/adivinhe?seed=42` em máquinas diferentes produzem exatamente a mesma rodada (mesmo estrutura, mesma operação, mesmos valores, mesma sequência de passos).
- **SC-006**: Após 1 hora de inatividade, um palpite sobre uma rodada antiga retorna o erro "rodada expirada" em menos de 100 ms e não deixa o cliente em estado quebrado.
- **SC-007**: Em um teste informal com pelo menos 3 estudantes que não participaram do design do jogo, cada um consegue identificar corretamente a estrutura por sua mecânica em pelo menos 4 de 7 rodadas (um exemplo de cada estrutura), confirmando que as mecânicas são distinguíveis.

## Assumptions

- O público-alvo já tem exposição às 7 estruturas via os mini-projetos existentes do Encaixe — o jogo é reforço, não primeira exposição.
- Reutilização do envelope `Passo` já criado na feature 002 (campos `indice`, `descricao`, `destaques`, `estado`); nenhuma mudança de contrato é imposta às estruturas por esta feature.
- O princípio constitucional "cada chamada stateless" é mantido no espírito: nenhum dado de usuário é persistido entre sessões. O mapeamento efêmero rodada→estrutura é estado de infraestrutura do jogo, não dado do usuário — vive em memória do processo e expira automaticamente. Alternativa aceitável: token assinado contendo a resposta correta (sem precisar de estado no servidor), decisão fica para o `/speckit-plan`.
- A visualização dos passos é propositalmente **neutra** — a página do jogo renderiza passos usando os controles e narrador genéricos já construídos (`StepControls` + `StepNarrator` da feature 002), mas NÃO renderiza diagramas específicos por estrutura (grid de heap, nós de BST, etc.). O jogador identifica a estrutura por descrições e destaques, não por desenho.
- Mobile não é prioridade na v1; o layout precisa não quebrar em telas pequenas, mas o desenho é otimizado para desktop.
- Sem autenticação, sem ranking, sem histórico persistente; cada sessão de jogo é independente — o estado "quantas rodadas acertei hoje" vive apenas na tela, se existir.
- Tempo de vida padrão da rodada: 1 hora, suficiente para qualquer sessão de estudo realista sem ocupar memória indefinidamente.

## Fora de escopo (ideias registradas para v2+)

- Ranking entre jogadores, pontuação acumulada entre rodadas, cronômetro, dificuldade crescente.
- Rodadas multi-operação (ex.: 3 pushes seguidos de 2 pops na mesma rodada) — v1 é sempre uma operação por rodada.
- Dicas intermediárias ("quer uma dica? verifique onde o elemento foi inserido").
- Variar o passo inicial em que o jogador entra na animação (sempre começa do passo 0 em v1).
- Compartilhar resultado em redes sociais.
- Modo "treino cego": sem revelar valores, só a mecânica.
