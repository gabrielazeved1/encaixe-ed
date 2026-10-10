"use client";

import type { PassoJogo } from "@/lib/api";

type Props = {
  passo: PassoJogo | null;
};

export function PassosGenericoVisual({ passo }: Props) {
  if (passo === null) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-white/60">
        Carregando passos…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-white/40">
          Passo {passo.indice + 1}
        </p>
        <p className="mt-1 text-base leading-relaxed text-white/90">
          {passo.descricao}
        </p>
      </div>

      {passo.destaques.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {passo.destaques.map((d) => (
            <span
              key={d}
              className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 font-mono text-xs text-blue-200"
            >
              {d}
            </span>
          ))}
        </div>
      )}

      <div className="rounded border border-white/10 bg-black/30 p-3">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-white/40">
          Estado interno
        </p>
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-white/80">
          {JSON.stringify(passo.estado, null, 2)}
        </pre>
      </div>
    </div>
  );
}
