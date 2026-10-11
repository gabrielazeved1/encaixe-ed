import Link from "next/link";

const STACK = [
  { label: "Frontend", items: ["Next.js 14 · App Router", "TypeScript strict", "Tailwind CSS"] },
  { label: "Backend", items: ["Django 5 · DRF", "Python 3.14", "pytest"] },
  { label: "Deploy", items: ["Vercel (frontend)", "Render (backend)"] },
];

const PROJETOS = [
  { slug: "pilha", nome: "Pilha de Chamadas", ed: "Pilha" },
  { slug: "escalonador", nome: "Escalonador de Processos", ed: "Fila + Heap" },
  { slug: "roteamento", nome: "Roteamento com Dijkstra", ed: "Grafo Ponderado" },
  { slug: "graus-de-separacao", nome: "Graus de Separação", ed: "Grafo Não Ponderado" },
  { slug: "busca-hash", nome: "Busca Linear vs. Hash Table", ed: "Hash Table" },
  { slug: "indice-bst", nome: "Índice com Árvore Binária", ed: "BST" },
  { slug: "alocador-memoria", nome: "Alocador de Memória", ed: "Lista Encadeada" },
];

export default function SobrePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-16">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Sobre o Encaixe</h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Encaixe é um projeto de estudo — estruturas de dados clássicas implementadas como
          mini-projetos que resolvem problemas reais, conectadas às disciplinas onde elas
          reaparecem com outros nomes.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Motivação</h2>
        <div className="text-slate-400 leading-relaxed space-y-3 text-sm">
          <p>
            A ideia surgiu durante a leitura do livro{" "}
            <span className="text-white font-medium">Entendendo Estruturas de Dados</span>,
            de Marcello La Rocca — no último semestre da graduação em Engenharia de
            Computação. Não foi trabalho de faculdade, não tinha nota. Foi curiosidade
            mesmo: vontade de programar algo e ver o que saía.
          </p>
          <p>
            Ao longo da graduação, estruturas de dados aparecem em Programação I, voltam
            em Algoritmos com outro nome, ressurgem em Sistemas Operacionais, em Redes,
            em Banco de Dados. O problema é que raramente alguém aponta o fio que conecta
            tudo isso. Você estuda pilha numa disciplina e usa call stack em outra sem
            perceber que é a mesma coisa.
          </p>
          <p>
            Se este site ajudar pelo menos um aluno a enxergar que entender o conceito
            por baixo vale mais do que decorar a sintaxe, já cumpriu o propósito. Os
            fundamentos aparecem de novo — sempre. Só muda o contexto.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Origem</h2>
        <div className="rounded-lg border border-slate-800 bg-[#161b27] px-5 py-4 flex items-start gap-4">
          <div className="shrink-0 w-10 h-14 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl">
            📖
          </div>
          <div>
            <p className="font-semibold text-white text-sm">
              Entendendo Estruturas de Dados
            </p>
            <p className="text-slate-400 text-sm mt-0.5">Marcello La Rocca</p>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              Os 7 mini-projetos deste site correspondem diretamente às estruturas cobertas
              no livro.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Os 7 projetos</h2>
        <ul className="space-y-2">
          {PROJETOS.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/projetos/${p.slug}`}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#161b27] px-4 py-3 hover:border-slate-600 transition-colors group"
              >
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {p.nome}
                </span>
                <span className="text-xs font-mono text-slate-500 group-hover:text-slate-400 transition-colors">
                  {p.ed}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Stack técnica</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STACK.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-slate-800 bg-[#161b27] p-4 space-y-2"
            >
              <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                {s.label}
              </p>
              <ul className="space-y-1">
                {s.items.map((item) => (
                  <li key={item} className="text-sm text-slate-300 font-mono">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500">
          Backend em Python puro — as estruturas de dados ficam em{" "}
          <code className="font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">
            core/estruturas/
          </code>{" "}
          sem nenhum import de Django, testáveis isoladamente.
        </p>
      </section>

      <section className="border-t border-slate-800 pt-8 text-center space-y-3">
        <p className="text-slate-500 text-sm">
          Último semestre de Engenharia de Computação na UFU — feito por curiosidade,
          sem nota, sem prazo.
        </p>
        <Link
          href="/projetos"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          Explorar os projetos
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
