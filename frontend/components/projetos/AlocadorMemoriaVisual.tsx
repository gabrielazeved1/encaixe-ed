"use client";

import { EstadoMemoria } from "@/lib/api";

type Props = {
  estado: EstadoMemoria;
};

const MEMORIA_TOTAL = 512;

export function AlocadorMemoriaVisual({ estado }: Props) {
  const fragPct = Math.round(estado.fragmentacao * 100);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-[#0d1117] border border-slate-700 p-4 space-y-3">
        <div className="flex justify-between text-xs font-mono text-slate-500">
          <span>0 B</span>
          <span>{MEMORIA_TOTAL} B</span>
        </div>
        <div className="flex h-8 rounded overflow-hidden border border-slate-800">
          {estado.blocos.map((bloco) => {
            const width = (bloco.tamanho / MEMORIA_TOTAL) * 100;
            return (
              <div
                key={bloco.id}
                title={`bloco ${bloco.id} · ${bloco.tamanho}B · ${bloco.livre ? "livre" : "usado"}`}
                className={`h-full flex items-center justify-center text-[10px] font-mono border-r border-slate-900 last:border-r-0 transition-all ${
                  bloco.livre
                    ? "bg-green-900/50 text-green-300"
                    : "bg-red-900/60 text-red-200"
                }`}
                style={{ width: `${width}%`, minWidth: "12px" }}
              >
                {width > 6 ? `#${bloco.id}` : ""}
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <span className="text-green-400">
            livre: {estado.livre_total}B
          </span>
          <span className="text-red-400">
            usado: {estado.usado_total}B
          </span>
          <span className="ml-auto text-orange-400">
            fragmentação: {fragPct}%
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 bg-[#0d1117] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs">
                bloco
              </th>
              <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs">
                tamanho
              </th>
              <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs">
                estado
              </th>
            </tr>
          </thead>
          <tbody>
            {estado.blocos.map((b) => (
              <tr
                key={b.id}
                className="border-t border-slate-800 font-mono text-slate-300"
              >
                <td className="px-3 py-1.5 text-slate-500">#{b.id}</td>
                <td className="px-3 py-1.5">{b.tamanho}B</td>
                <td
                  className={`px-3 py-1.5 ${b.livre ? "text-green-400" : "text-red-400"}`}
                >
                  {b.livre ? "livre" : "usado"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
