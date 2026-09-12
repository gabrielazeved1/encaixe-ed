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

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Badge de overflow */}
      {isOverflow && (
        <div className="w-full rounded-lg bg-red-900/60 border border-red-500 px-4 py-2 text-center text-red-300 font-mono text-sm">
          ⚠ Stack Overflow — profundidade máxima atingida
        </div>
      )}

      {/* Visualização da pilha */}
      <div className="flex flex-col-reverse gap-1 w-full max-w-xs min-h-48">
        {pilha.map((frame, i) => {
          const isTop = i === pilha.length - 1;
          return (
            <div
              key={`${frame.nome_funcao}-${frame.profundidade}-${i}`}
              className={`
                px-4 py-2 rounded border font-mono text-sm transition-all
                ${isTop ? "border-blue-400 bg-blue-900/50 text-blue-200" : "border-gray-600 bg-gray-800 text-gray-300"}
              `}
            >
              <span className="text-gray-500 text-xs mr-2">[{frame.profundidade}]</span>
              {frame.nome_funcao}({frame.argumento})
              {frame.retorno !== null && (
                <span className="ml-2 text-green-400">→ {frame.retorno}</span>
              )}
            </div>
          );
        })}

        {pilha.length === 0 && !isOverflow && (
          <div className="flex items-center justify-center h-48 text-gray-600 text-sm border border-dashed border-gray-700 rounded">
            pilha vazia
          </div>
        )}
      </div>

      {/* Contador de eventos */}
      <p className="text-gray-500 text-xs">
        evento {eventoAtual + 1} de {frames.length}
        {" · "}
        <span className={evento?.tipo === "push" ? "text-blue-400" : evento?.tipo === "overflow" ? "text-red-400" : "text-green-400"}>
          {evento?.tipo}
        </span>
      </p>
    </div>
  );
}
