"use client";

import type { Camada, VereditoParcial } from "@/lib/api";

type Props = {
  vereditos: [VereditoParcial, VereditoParcial, VereditoParcial];
  pontuacao: 0 | 1 | 2 | 3;
  onProxima: () => void;
};

const ROTULOS: Record<Camada, string> = {
  estrutura: "Estrutura",
  operacao: "Operação",
  complexidade: "Complexidade",
};

function Estrela({ preenchida }: { preenchida: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-10 w-10 ${
        preenchida
          ? "fill-amber-300 stroke-amber-300"
          : "fill-transparent stroke-white/30"
      }`}
      strokeWidth={1.5}
      aria-hidden
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

export function VereditoFinal({ vereditos, pontuacao, onProxima }: Props) {
  return (
    <section
      aria-label="Veredito final"
      className="flex flex-col gap-6 rounded-lg border border-white/10 bg-white/5 p-6"
    >
      <header className="flex flex-col items-center gap-3">
        <p className="text-sm uppercase tracking-wider text-white/60">
          Resultado da rodada
        </p>
        <div
          className="flex items-center gap-2"
          aria-label={`${pontuacao} de 3 acertos`}
        >
          <Estrela preenchida={pontuacao >= 1} />
          <Estrela preenchida={pontuacao >= 2} />
          <Estrela preenchida={pontuacao >= 3} />
        </div>
        <p className="text-2xl font-semibold text-white">
          {pontuacao} <span className="text-white/50">/ 3</span>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {vereditos.map((v, i) => (
          <article
            key={v.camada}
            style={{ animationDelay: `${i * 100}ms` }}
            className={`veredito-card flex flex-col gap-3 rounded-lg border p-4 ${
              v.acertou
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-amber-500/40 bg-amber-500/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-lg ${
                  v.acertou
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
                aria-hidden
              >
                {v.acertou ? "✓" : "✕"}
              </span>
              <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
                {ROTULOS[v.camada]}
              </p>
            </div>
            <p className="text-sm text-white/90">
              <span className="text-white/60">Resposta correta: </span>
              <strong
                className={`underline underline-offset-4 ${
                  v.acertou ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {v.correto}
              </strong>
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              {v.explicacao}
            </p>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={onProxima}
        className="self-center rounded-lg border border-blue-500/60 bg-blue-500/20 px-6 py-2 text-sm font-medium text-blue-100 transition hover:border-blue-400 hover:bg-blue-500/30"
      >
        Próxima rodada →
      </button>
    </section>
  );
}
