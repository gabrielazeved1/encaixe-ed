"use client";

import type { Camada, VereditoParcial } from "@/lib/api";

type Props = {
  camadaAtual: Camada;
  vereditosParciais: VereditoParcial[];
};

const CAMADAS: Camada[] = ["estrutura", "operacao", "complexidade"];
const ROTULOS: Record<Camada, string> = {
  estrutura: "Estrutura",
  operacao: "Operação",
  complexidade: "Complexidade",
};

export function ProgressoRodada({ camadaAtual, vereditosParciais }: Props) {
  const indiceAtual = CAMADAS.indexOf(camadaAtual);
  const numero = vereditosParciais.length + 1;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm uppercase tracking-wider text-white/60">
        Pergunta {numero} de 3 — {ROTULOS[camadaAtual]}
      </p>
      <div className="flex items-center gap-2" aria-label="Progresso">
        {CAMADAS.map((c, i) => {
          const veredito = vereditosParciais[i];
          const atual = i === indiceAtual;
          let classe = "border-white/20 bg-white/10";
          if (veredito) {
            classe = veredito.acertou
              ? "border-emerald-400 bg-emerald-500/40"
              : "border-amber-400 bg-amber-500/40";
          } else if (atual) {
            classe = "border-blue-400 bg-blue-500/40";
          }
          return (
            <span
              key={c}
              className={`h-3 w-3 rounded-full border ${classe}`}
              aria-label={`${ROTULOS[c]} — ${
                veredito
                  ? veredito.acertou
                    ? "acertou"
                    : "errou"
                  : atual
                    ? "atual"
                    : "pendente"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
