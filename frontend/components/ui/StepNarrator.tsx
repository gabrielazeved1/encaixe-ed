"use client";

type Props = {
  descricao: string | null;
  destaques: string[];
  indice: number | null;
  totalPassos: number;
};

export function StepNarrator({ descricao, destaques, indice, totalPassos }: Props) {
  if (totalPassos === 0 || descricao === null || indice === null) {
    return (
      <aside className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/60">
        Nenhuma operação executada ainda.
      </aside>
    );
  }

  return (
    <aside className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>Narrador</span>
        <span className="font-mono">
          passo {indice + 1}/{totalPassos}
        </span>
      </div>
      <p className="leading-relaxed text-white/90">{descricao}</p>
      {destaques.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {destaques.map((d) => (
            <span
              key={d}
              className="rounded border border-white/15 px-2 py-0.5 font-mono text-[10px] text-white/60"
            >
              {d}
            </span>
          ))}
        </div>
      )}
    </aside>
  );
}
