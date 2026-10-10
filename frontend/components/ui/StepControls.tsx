"use client";

type Props = {
  indice: number;
  totalPassos: number;
  podeAvancar: boolean;
  podeVoltar: boolean;
  onVoltar: () => void;
  onAvancar: () => void;
  onResetar: () => void;
};

export function StepControls({
  indice,
  totalPassos,
  podeAvancar,
  podeVoltar,
  onVoltar,
  onAvancar,
  onResetar,
}: Props) {
  if (totalPassos === 0) return null;

  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        type="button"
        onClick={onResetar}
        className="rounded border border-white/20 px-3 py-1.5 text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-40"
        aria-label="Reiniciar"
      >
        ↺
      </button>
      <button
        type="button"
        onClick={onVoltar}
        disabled={!podeVoltar}
        className="rounded border border-white/20 px-3 py-1.5 text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Passo anterior"
      >
        ‹ Anterior
      </button>
      <span className="min-w-[7rem] text-center font-mono text-white/70">
        passo {indice + 1} de {totalPassos}
      </span>
      <button
        type="button"
        onClick={onAvancar}
        disabled={!podeAvancar}
        className="rounded border border-white/20 px-3 py-1.5 text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Próximo passo"
      >
        Próximo ›
      </button>
    </div>
  );
}
