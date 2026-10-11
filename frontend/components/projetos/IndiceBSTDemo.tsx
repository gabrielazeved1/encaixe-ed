"use client";

import { useState } from "react";
import { useIndiceBST } from "@/hooks/useIndiceBST";
import { IndiceBSTVisual } from "@/components/projetos/IndiceBSTVisual";

export function IndiceBSTDemo() {
  const [valoresTexto, setValoresTexto] = useState<string>("8,4,12,2,6,10,14");
  const [alvo, setAlvo] = useState<string>("6");

  const { resultado, loading, erro, simular } = useIndiceBST();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valores = valoresTexto
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const a = parseInt(alvo, 10);
    if (isNaN(a) || valores.length === 0) return;
    await simular(valores, a);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white mb-3">
          Demonstração interativa
        </h2>
        <div className="rounded-lg border border-teal-500/20 bg-teal-900/10 px-4 py-3 text-xs text-slate-300 leading-relaxed space-y-1">
          <p>
            <span className="text-teal-300 font-semibold">Como funciona:</span>{" "}
            cada valor inserido desce pela árvore comparando com cada nó —{" "}
            <span className="text-white">menor vai à esquerda</span>,{" "}
            <span className="text-white">maior vai à direita</span>. A busca
            segue o mesmo caminho: a cada comparação, metade da árvore é
            descartada — O(log n) esperado.
          </p>
          <p>
            <span className="text-teal-300 font-semibold">Atenção à ordem:</span>{" "}
            os mesmos números em ordens diferentes geram árvores completamente
            diferentes. Insira{" "}
            <span className="text-white font-mono">1,2,3,4,5,6,7</span> para ver
            a árvore degenerada (vira lista) onde a busca passa a custar O(n).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Valores para inserir{" "}
            <span className="text-slate-600">
              — a ordem define o formato da árvore
            </span>
          </label>
          <input
            type="text"
            value={valoresTexto}
            onChange={(e) => setValoresTexto(e.target.value)}
            className="w-full bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-teal-500"
            placeholder="ex: 8,4,12,2,6,10,14"
          />
        </div>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Buscar valor{" "}
              <span className="text-slate-600">— deve estar nos valores acima</span>
            </label>
            <input
              type="number"
              value={alvo}
              onChange={(e) => setAlvo(e.target.value)}
              className="w-32 bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
          >
            {loading ? "Simulando…" : "Simular"}
          </button>
        </div>
      </form>

      {erro && <p className="text-red-400 text-sm mb-4">{erro}</p>}

      {resultado ? (
        <IndiceBSTVisual passos={resultado.passos} />
      ) : (
        <EmptyStateBST />
      )}
    </div>
  );
}

function EmptyStateBST() {
  const edges: [number, number, number, number][] = [
    [100, 20, 55, 62],
    [100, 20, 145, 62],
    [55, 62, 28, 104],
    [55, 62, 82, 104],
    [145, 62, 118, 104],
    [145, 62, 172, 104],
  ];
  const nodes = [
    { cx: 100, cy: 20, v: "8" },
    { cx: 55, cy: 62, v: "4" },
    { cx: 145, cy: 62, v: "12" },
    { cx: 28, cy: 104, v: "2" },
    { cx: 82, cy: 104, v: "6" },
    { cx: 118, cy: 104, v: "10" },
    { cx: 172, cy: 104, v: "14" },
  ];
  return (
    <div className="rounded-lg border border-slate-700 bg-[#0d1117] p-6">
      <svg viewBox="0 0 200 122" className="w-full max-w-sm mx-auto">
        {edges.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgb(45 212 191)"
            strokeWidth="1.5"
            opacity="0.3"
          />
        ))}
        {nodes.map((n) => (
          <g key={n.v}>
            <circle
              cx={n.cx}
              cy={n.cy}
              r={13}
              fill="rgb(19 78 74)"
              stroke="rgb(45 212 191)"
              strokeWidth="1.5"
            />
            <text
              x={n.cx}
              y={n.cy + 4}
              textAnchor="middle"
              fill="rgb(204 251 241)"
              fontSize="10"
              fontFamily="monospace"
            >
              {n.v}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-center text-slate-500 text-xs font-mono mt-3">
        aguardando busca...
      </p>
    </div>
  );
}
