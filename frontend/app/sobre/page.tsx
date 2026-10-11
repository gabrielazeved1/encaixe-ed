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
            de Marcello La Rocca. À medida que ia lendo, percebia que cada estrutura
            não era um conceito isolado — ela já tinha aparecido em outra disciplina com
            outro nome, ou ia aparecer em breve em outra ainda.
          </p>
          <p>
            O site nasceu com um propósito simples: ter um lugar para voltar e lembrar
            onde vi cada conceito pela primeira vez, ver a estrutura funcionando de verdade
            e entender em qual contexto real ela se encaixa. Menos referência técnica,
            mais âncora de memória.
          </p>
          <p>
            Estruturas de dados aparecem na graduação em Programação I, voltam em
            Algoritmos, ressurgem em Sistemas Operacionais com outro nome, e de novo em
            Redes, em Banco de Dados, em Compiladores. O problema é que raramente alguém
            aponta o fio que conecta tudo isso — e esse fio é o que cada projeto aqui
            tenta deixar explícito.
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
              no livro. A leitura foi o gatilho — cada capítulo gerou um projeto, cada
              projeto gerou uma conexão com alguma disciplina da engenharia.
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
          Projeto desenvolvido durante a graduação em Engenharia de Computação na UFU.
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
