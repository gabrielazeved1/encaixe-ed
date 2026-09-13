import Link from "next/link";
import { HeroAnimation } from "@/components/ui/HeroAnimation";

const FEATURES = [
  {
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    titulo: "Aprenda na prática",
    descricao: "Interaja com estruturas rodando de verdade, não só animações.",
  },
  {
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    titulo: "Conecte com a faculdade",
    descricao: "Cada projeto mostra onde a estrutura aparece nas disciplinas.",
  },
  {
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    titulo: "Entenda de verdade",
    descricao: "Complexidade, operações e intuição — sem decoreba.",
  },
  {
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    titulo: "Código real",
    descricao: "Backend em Python puro, frontend em Next.js — sem mágica.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Estruturas de Dados
            </h1>
            <h1 className="text-5xl font-bold text-blue-400 leading-tight">
              em Ação
            </h1>
          </div>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Estruturas de dados clássicas rodando de verdade, resolvendo
            problemas práticos, ligadas às disciplinas onde elas reaparecem
            disfarçadas de outro nome.
          </p>
          <Link
            href="/projetos"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Explorar Projetos
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <HeroAnimation />
      </section>

      <section className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.titulo}
              className="rounded-lg border border-slate-800 bg-[#161b27] p-5 space-y-2"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-500/15 text-blue-400">
                {f.icon}
              </span>
              <h3 className="font-semibold text-white text-sm">{f.titulo}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {f.descricao}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-white font-semibold">
              Baseado em{" "}
              <span className="text-blue-400">
                Entendendo Estruturas de Dados
              </span>
            </p>
            <p className="text-slate-500 text-sm">
              Marcello La Rocca · 7 estruturas, 7 projetos práticos
            </p>
          </div>
          <Link
            href="/projetos"
            className="shrink-0 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Ver todos os projetos
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
