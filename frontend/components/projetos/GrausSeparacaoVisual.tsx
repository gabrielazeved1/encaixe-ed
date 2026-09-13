"use client";

type Props = {
  caminho: string[];
  graus: number;
  niveis: { nivel: number; nos: string[] }[];
  nomesCaminho: string[];
};

export function GrausSeparacaoVisual({
  caminho,
  graus,
  niveis,
  nomesCaminho,
}: Props) {
  if (caminho.length === 0 || graus < 0) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-500/40 px-4 py-3 text-center text-red-300 font-mono text-sm">
        Sem conexão entre as pessoas
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-[#0d1117] border border-slate-700 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Caminho
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            {graus} {graus === 1 ? "grau" : "graus"} de separação
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          {nomesCaminho.map((nome, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-indigo-900/50 border border-indigo-500/50 text-indigo-200">
                {nome}
              </span>
              {i < nomesCaminho.length - 1 && (
                <span className="text-slate-600">→</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-[#0d1117] border border-slate-700 p-4 space-y-3">
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          Camadas BFS
        </p>
        <div className="space-y-2">
          {niveis.map((nivel) => (
            <div key={nivel.nivel} className="flex items-start gap-3">
              <span className="text-xs font-mono text-slate-500 mt-1.5 w-16 shrink-0">
                nível {nivel.nivel}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {nivel.nos.map((no) => (
                  <span
                    key={no}
                    className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 border border-slate-700 text-slate-300"
                  >
                    {no}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
