"use client";

type Props = {
  indice: number;
  totalPassos: number;
  podeAvancar: boolean;
  podeVoltar: boolean;
  onVoltar: () => void;
  onAvancar: () => void;
  onResetar: () => void;
  tocando?: boolean;
  velocidade?: number;
  onTocar?: () => void;
  onPausar?: () => void;
  onMudarVelocidade?: (v: number) => void;
};

const VELOCIDADES = [0.5, 1, 2] as const;

export function StepControls({
  indice,
  totalPassos,
  podeAvancar,
  podeVoltar,
  onVoltar,
  onAvancar,
  onResetar,
  tocando,
  velocidade,
  onTocar,
  onPausar,
  onMudarVelocidade,
}: Props) {
  if (totalPassos === 0) return null;

  const temAutoplay =
    onTocar !== undefined &&
    onPausar !== undefined &&
    tocando !== undefined &&
    velocidade !== undefined &&
    onMudarVelocidade !== undefined;
  const atingiuFim = indice >= totalPassos - 1;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
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

      {temAutoplay && (
        <button
          type="button"
          onClick={tocando ? onPausar : onTocar}
          disabled={atingiuFim && !tocando}
          aria-label={tocando ? "Pausar" : "Tocar"}
          className="rounded border border-blue-500/60 bg-blue-900/40 px-3 py-1.5 text-blue-100 transition hover:border-blue-400 hover:bg-blue-900/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {tocando ? "⏸ Pausar" : "▶ Tocar"}
        </button>
      )}

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

      {temAutoplay && (
        <div
          role="group"
          aria-label="Velocidade"
          className="flex items-center gap-1 rounded border border-white/20 px-1 py-1 text-xs"
        >
          {VELOCIDADES.map((v) => {
            const ativo = v === velocidade;
            return (
              <button
                key={v}
                type="button"
                onClick={() => onMudarVelocidade(v)}
                aria-pressed={ativo}
                className={`rounded px-2 py-0.5 font-mono transition ${
                  ativo
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {v}×
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
