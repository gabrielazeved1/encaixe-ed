"use client";

import { GanttItem } from "@/lib/api";

type Props = {
  gantt: GanttItem[];
  tempoTotal: number;
};

const CORES = [
  "bg-blue-500 border-blue-400 text-blue-50",
  "bg-green-500 border-green-400 text-green-50",
  "bg-purple-500 border-purple-400 text-purple-50",
  "bg-orange-500 border-orange-400 text-orange-50",
  "bg-pink-500 border-pink-400 text-pink-50",
  "bg-teal-500 border-teal-400 text-teal-50",
];

function corPara(id: string): string {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) % 997;
  return CORES[hash % CORES.length];
}

export function EscalonadorVisual({ gantt, tempoTotal }: Props) {
  if (gantt.length === 0 || tempoTotal === 0) {
    return (
      <p className="text-slate-500 text-sm text-center py-8">
        Nenhum processo escalonado.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-[#0d1117] border border-slate-700 p-4 overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {gantt.map((item, i) => {
            const largura = ((item.fim - item.inicio) / tempoTotal) * 100;
            return (
              <div
                key={`${item.processo_id}-${i}`}
                className={`${corPara(item.processo_id)} border rounded px-2 py-3 font-mono text-xs text-center transition-all`}
                style={{ width: `${largura}%`, minWidth: "48px" }}
              >
                <div className="font-semibold">{item.nome}</div>
                <div className="opacity-80 text-[10px] mt-0.5">
                  {item.inicio}→{item.fim}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex justify-between text-[10px] text-slate-500 font-mono">
          <span>t = 0</span>
          <span>t = {tempoTotal}</span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 bg-[#0d1117] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs">
                #
              </th>
              <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs">
                processo
              </th>
              <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs">
                início
              </th>
              <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs">
                fim
              </th>
              <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs">
                duração
              </th>
            </tr>
          </thead>
          <tbody>
            {gantt.map((item, i) => (
              <tr
                key={i}
                className="border-t border-slate-800 font-mono text-slate-300"
              >
                <td className="px-3 py-1.5 text-slate-500">{i + 1}</td>
                <td className="px-3 py-1.5">{item.nome}</td>
                <td className="px-3 py-1.5">{item.inicio}</td>
                <td className="px-3 py-1.5">{item.fim}</td>
                <td className="px-3 py-1.5 text-slate-400">
                  {item.fim - item.inicio}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
