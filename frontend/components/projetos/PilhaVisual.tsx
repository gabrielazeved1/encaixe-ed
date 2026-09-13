"use client";

import { Evento } from "@/lib/api";

type Props = {
  frames: Evento[];
  status: "completo" | "overflow";
  eventoAtual: number;
};

export function PilhaVisual({ frames, status, eventoAtual }: Props) {
  const evento = frames[eventoAtual];
  const pilha = evento?.pilha_estado ?? [];
  const isOverflow = evento?.tipo === "overflow";

  const tipoCor =
    evento?.tipo === "push"
      ? "text-blue-400"
      : evento?.tipo === "overflow"
        ? "text-red-400"
        : "text-green-400";

  return (
    <div className="space-y-4">
      {isOverflow && (
        <div className="rounded-lg bg-red-900/30 border border-red-500/60 px-4 py-2.5 text-center text-red-300 font-mono text-sm">
          ⚠ Stack Overflow — profundidade máxima atingida
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex flex-col-reverse gap-1 flex-1 min-h-48 bg-[#0d1117] rounded-lg border border-slate-700 p-3">
          {pilha.map((frame, i) => {
            const isTop = i === pilha.length - 1;
            return (
              <div
                key={`${frame.nome_funcao}-${frame.profundidade}-${i}`}
                className={`
                  px-3 py-2 rounded border font-mono text-sm transition-all
                  ${
                    isTop
                      ? "bg-blue-900/50 border-blue-500 text-blue-200"
                      : "bg-slate-800 border-slate-600 text-slate-300"
                  }
                `}
              >
                <span className="text-slate-500 text-xs mr-2">
                  [{frame.profundidade}]
                </span>
                {frame.nome_funcao}({frame.argumento})
                {frame.retorno !== null && (
                  <span className="ml-2 text-green-400">→ {frame.retorno}</span>
                )}
                {isTop && (
                  <span className="ml-2 text-blue-400/60 text-xs">← topo</span>
                )}
              </div>
            );
          })}

          {pilha.length === 0 && !isOverflow && (
            <div className="flex items-center justify-center h-full min-h-36 text-slate-600 text-sm">
              pilha vazia
            </div>
          )}
        </div>
      </div>

      <p className="text-slate-500 text-xs text-center">
        evento {eventoAtual + 1} de {frames.length}
        {" · "}
        <span className={tipoCor}>{evento?.tipo}</span>
      </p>
    </div>
  );
}
