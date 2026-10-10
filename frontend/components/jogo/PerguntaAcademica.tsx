"use client";

import type { PerguntaRevelada } from "@/lib/api";

type Props = {
  pergunta: PerguntaRevelada;
  selecionada: number | null;
  onSelecionar: (idx: number) => void;
  onConfirmar: () => void;
  desabilitado: boolean;
};

const LETRAS = ["A", "B", "C", "D"] as const;

export function PerguntaAcademica({
  pergunta,
  selecionada,
  onSelecionar,
  onConfirmar,
  desabilitado,
}: Props) {
  return (
    <section
      aria-label="Pergunta"
      className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-5"
    >
      <p className="text-base leading-relaxed text-white/90">
        {pergunta.enunciado}
      </p>

      <div className="flex flex-col gap-2">
        {pergunta.alternativas.map((alt, idx) => {
          const ativa = selecionada === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelecionar(idx)}
              disabled={desabilitado}
              aria-pressed={ativa}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                ativa
                  ? "border-blue-400 bg-blue-500/20 text-white"
                  : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm font-semibold ${
                  ativa
                    ? "border-blue-300 bg-blue-400/30 text-blue-50"
                    : "border-white/20 bg-white/10 text-white/70"
                }`}
                aria-hidden
              >
                {LETRAS[idx]}
              </span>
              <span className="flex-1 text-sm leading-relaxed">{alt}</span>
              <span
                className="shrink-0 text-xs text-white/40"
                aria-hidden
                title="Atalho de teclado"
              >
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onConfirmar}
        disabled={desabilitado || selecionada === null}
        className="self-end rounded-lg border border-blue-500/60 bg-blue-500/20 px-5 py-2 text-sm font-medium text-blue-100 transition hover:border-blue-400 hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Confirmar
      </button>
    </section>
  );
}
