export type Disciplina = {
  nome: string;
  relacao: string;
};

export type Projeto = {
  slug: string;
  nome: string;
  descricao: string;
  ed: string;
  disciplinas: Disciplina[];
  textoEd: string;
};

export const projetos: Projeto[] = [
  {
    slug: "pilha",
    nome: "Visualizador de Pilha de Chamadas",
    descricao:
      "Veja a pilha de chamadas crescer e encolher em tempo real ao executar funções recursivas.",
    ed: "Pilha (Stack)",
    disciplinas: [
      {
        nome: "Arquitetura de Computadores",
        relacao:
          "A pilha de chamadas (call stack) é gerenciada pelo processador. Cada chamada de função empilha um stack frame com os registradores salvos, endereço de retorno e variáveis locais.",
      },
      {
        nome: "Sistemas Operacionais",
        relacao:
          "O SO aloca uma região de memória chamada stack para cada thread do processo. O tamanho é limitado — estourar esse limite é o famoso stack overflow.",
      },
    ],
    textoEd: `Uma pilha é uma estrutura LIFO (Last In, First Out): o último elemento inserido é o primeiro a sair.

É exatamente assim que a pilha de chamadas (call stack) do seu processador funciona — cada chamada de função empilha um novo quadro de execução (stack frame) com os parâmetros, variáveis locais e endereço de retorno. Quando a função retorna, esse frame é desempilhado.

Entender pilha é entender por que recursão funciona, e por que ela pode estourar. Cada chamada recursiva empilha um novo frame — se a recursão não tem caso base ou o valor é grande demais, a pilha cresce além do limite e o sistema operacional lança um stack overflow.`,
  },
];

export function getProjetoBySlug(slug: string): Projeto | undefined {
  return projetos.find((p) => p.slug === slug);
}
