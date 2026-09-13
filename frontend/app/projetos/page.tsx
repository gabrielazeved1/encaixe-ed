import Link from "next/link";
import { projetos, COR_CLASSES } from "@/content/projetos";

function ProjetoIcone({ cor }: { cor: keyof typeof COR_CLASSES }) {
  const classes = COR_CLASSES[cor];
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${classes.bg} ${classes.text}`}
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </span>
  );
}

export default function ProjetosPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10 space-y-2">
        <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
          Nossos Projetos
        </p>
        <h1 className="text-3xl font-bold text-white">
          Escolha uma estrutura de dados
        </h1>
        <p className="text-slate-400 max-w-xl">
          Cada projeto usa uma estrutura de dados clássica para resolver um
          problema real, conectando teoria da faculdade com código que roda de
          verdade.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {projetos.map((p) => {
          const classes = COR_CLASSES[p.cor];
          return (
            <Link
              key={p.slug}
              href={`/projetos/${p.slug}`}
              className="group relative flex flex-col gap-3 rounded-xl border border-slate-800 bg-[#161b27] p-5 hover:border-slate-600 transition-colors"
            >
              <ProjetoIcone cor={p.cor} />

              <div className="flex-1 space-y-1">
                <p className={`text-sm font-bold ${classes.text}`}>{p.ed}</p>
                <p className="text-white font-medium text-sm leading-snug">
                  {p.nome}
                </p>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                  {p.descricao}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {p.disciplinas.map((d) => (
                  <span
                    key={d.nome}
                    className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  >
                    {d.nome}
                  </span>
                ))}
              </div>

              <span className="absolute bottom-4 right-4 text-slate-600 group-hover:text-slate-400 transition-colors text-sm">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
