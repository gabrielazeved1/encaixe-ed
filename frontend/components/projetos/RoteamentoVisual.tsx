"use client";

import { PassoDijkstra } from "@/lib/api";

type Props = {
  caminho: string[];
  custoTotal: number;
  passos: PassoDijkstra[];
};

export function RoteamentoVisual({ caminho, custoTotal, passos }: Props) {
  if (caminho.length === 0 || custoTotal < 0) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-500/40 px-4 py-3 text-center text-red-300 font-mono text-sm">
        Sem caminho entre origem e destino
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-[#0d1117] border border-slate-700 p-4 space-y-3">
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          Rota encontrada
        </p>
        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          {caminho.map((no, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-purple-900/50 border border-purple-500/50 text-purple-200">
                {no}
              </span>
              {i < caminho.length - 1 && (
                <span className="text-slate-600">→</span>
              )}
            </span>
          ))}
        </div>
        <p className="text-slate-400 font-mono text-sm">
          custo total:{" "}
          <span className="text-purple-300 font-semibold">{custoTotal}</span>
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-[#0d1117] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs">
                nó visitado
              </th>
              <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs">
                custo acumulado
              </th>
              <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs">
                via
              </th>
            </tr>
          </thead>
          <tbody>
            {passos.map((passo, i) => (
              <tr
                key={i}
                className="border-t border-slate-800 font-mono text-slate-300"
              >
                <td className="px-3 py-1.5 text-purple-300">{passo.no}</td>
                <td className="px-3 py-1.5">{passo.custo_acumulado}</td>
                <td className="px-3 py-1.5 text-slate-500">
                  {passo.via ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
