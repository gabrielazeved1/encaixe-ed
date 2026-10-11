# Por que fundamentos ainda importam — mesmo quando tudo muda

Em 2024, um desenvolvedor júnior pode construir uma aplicação completa sem entender como a memória funciona. Pode fazer deploy sem saber o que acontece quando um pacote viaja pela rede. Pode usar um banco de dados sem nunca ter pensado em como um índice é implementado por baixo.

Isso é uma vitória da abstração — e também um risco silencioso.

---

## O problema não é aprender frameworks. É só aprender frameworks.

Os frameworks mudam. Sempre mudaram, sempre vão mudar.

jQuery dominou a web por uma década. Flash construiu a internet interativa dos anos 2000 e sumiu do mapa. AngularJS virou Angular que virou um ecossistema inteiro. O desenvolvedor que apostou tudo em aprender a sintaxe do momento ficou para trás quando o momento passou.

Mas o desenvolvedor que entendeu *por que* o DOM funciona de um jeito, *o que* o jQuery estava abstraindo, *como* a reatividade resolve um problema real — esse migrou de um framework para o outro sem drama. Porque o conhecimento que ele carregava não estava amarrado a nenhuma ferramenta específica.

Fundamentos não são o que você aprende antes de aprender a coisa de verdade. Fundamentos *são* a coisa de verdade.

---

## A mesma estrutura, dez nomes diferentes

Pega uma pilha.

Você encontra ela em Programação I como um exercício acadêmico. Reaparece em Arquitetura de Computadores como call stack — a região de memória que o processador usa para controlar chamadas de função. Em Sistemas Operacionais você descobre que stack overflow não é só um site de perguntas. Em compiladores, a pilha controla a análise sintática. No VS Code, o Ctrl+Z é uma pilha de operações.

É sempre a mesma ideia: última a entrar, primeira a sair. Empilha. Desempilha. O contexto muda, o nome muda, a linguagem muda. A estrutura é a mesma.

O mesmo acontece com grafos (Redes de Computadores, Sistemas Distribuídos, redes sociais), com hash tables (dicionários em Python, caches, DNS, índices de banco de dados), com árvores binárias (o índice B-Tree que torna suas queries rápidas é a evolução direta da BST que você viu na aula).

Quando você entende a estrutura, você não aprende uma coisa. Você aprende a reconhecer um padrão que aparece em dezenas de contextos diferentes ao longo da carreira.

---

## "Mas a IA vai fazer isso por mim"

Talvez. Parcialmente. Por um tempo.

Ferramentas de IA são extraordinárias em gerar código que *parece* certo. São ruins em saber *quando* usar uma hash table em vez de uma árvore binária, *por que* esse algoritmo vai ser O(n²) no pior caso, *como* esse design vai se comportar sob carga.

Essas perguntas exigem modelo mental, não autocompletar. E modelos mentais sólidos vêm de entender os fundamentos — não de ter visto muita sintaxe.

O desenvolvedor que sabe o que está pedindo para a IA gerar vai sempre ter vantagem sobre quem aceita o primeiro output sem questionar. Entender estruturas de dados é parte do que faz você conseguir questionar.

---

## A era dos frameworks rápidos exige raízes profundas

Quanto mais rápido o ecossistema muda, mais valioso se torna o conhecimento que não muda.

Dijkstra publicou o algoritmo de caminho mínimo em 1959. Ele roda hoje nos roteadores que entregam cada pacote da sua requisição HTTP, nas CDNs que servem seu JavaScript, nos sistemas de navegação do seu celular. Sessenta e cinco anos. Nenhum framework dura sessenta e cinco anos.

Estruturas de dados são assim. Algoritmos são assim. Os princípios de como memória funciona, de como dados são organizados, de como sistemas se comunicam — são assim.

Não é nostalgia acadêmica. É a percepção de que algumas ideias são tão fundamentalmente corretas que o setor continua redescobrinodo-as, renomeando-as e reempacotando-as a cada geração.

---

## O que este projeto tenta fazer

Não é um curso. Não substitui uma disciplina. Não tem certificado.

É uma tentativa de tornar visível o que normalmente fica implícito: que a pilha que você estudou *é* a call stack que você debugou, *é* o histórico de undo do editor, *é* a navegação do browser. Que o grafo da aula de teoria *é* o protocolo OSPF rodando nos roteadores da internet, *é* o feed de recomendação da rede social.

Se você sair daqui tendo visto pelo menos uma conexão que não tinha visto antes — entre uma estrutura que você conhecia e um sistema que você usa todo dia — o projeto cumpriu o que veio fazer.

---

*Encaixe foi construído no último semestre de Engenharia de Computação na UFU, durante a leitura de "Entendendo Estruturas de Dados" de Marcello La Rocca. Sem nota. Sem prazo. Por curiosidade.*

← [Voltar para o projeto](README.md)
