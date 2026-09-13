"use client";

import { useMemo, useState } from "react";
import { useRoteamento } from "@/hooks/useRoteamento";
import { RoteamentoVisual } from "@/components/projetos/RoteamentoVisual";
import { ArestaRot } from "@/lib/api";

const NOS_INICIAL = "A,B,C,D,E";
const ARESTAS_INICIAL = "A-B:2\nB-C:3\nA-C:10\nC-D:1\nB-D:8\nD-E:4";

function parseArestas(texto: string): ArestaRot[] {
  const linhas = texto.split("\n").map((l) => l.trim()).filter(Boolean);
  const arestas: ArestaRot[] = [];
  for (const l of linhas) {
    const match = l.match(/^([A-Za-z0-9_]+)\s*-\s*([A-Za-z0-9_]+)\s*:\s*(\d+)$/);
    if (match) {
      arestas.push({
        origem: match[1],
        destino: match[2],
        custo: parseInt(match[3], 10),
      });
    }
  }
  return arestas;
}

export function RoteamentoDemo() {
  const [nosTexto, setNosTexto] = useState<string>(NOS_INICIAL);
  const [arestasTexto, setArestasTexto] = useState<string>(ARESTAS_INICIAL);
  const [origem, setOrigem] = useState<string>("A");
  const [destino, setDestino] = useState<string>("E");

  const { resultado, loading, erro, simular } = useRoteamento();

  const nos = useMemo(
    () => nosTexto.split(",").map((n) => n.trim()).filter(Boolean),
    [nosTexto]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const arestas = parseArestas(arestasTexto);
    await simular(nos, arestas, origem, destino);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6">
      <h2 className="text-base font-semibold text-white mb-5">
        Demonstração interativa
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Nós{" "}
            <span className="text-slate-600">— roteadores separados por vírgula</span>
          </label>
          <input
            type="text"
            value={nosTexto}
            onChange={(e) => setNosTexto(e.target.value)}
            className="w-full bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
            placeholder="ex: A,B,C,D"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Links{" "}
            <span className="text-slate-600">— um por linha no formato</span>{" "}
            <span className="text-purple-400 font-mono">origem-destino:custo</span>
          </label>
          <textarea
            value={arestasTexto}
            onChange={(e) => setArestasTexto(e.target.value)}
            rows={5}
            className="w-full bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Origem
            </label>
            <select
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              {nos.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Destino
            </label>
            <select
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              {nos.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
          >
            {loading ? "Calculando…" : "Calcular rota"}
          </button>
        </div>
      </form>

      {erro && <p className="text-red-400 text-sm mb-4">{erro}</p>}

      {resultado ? (
        <RoteamentoVisual
          caminho={resultado.caminho}
          custoTotal={resultado.custo_total}
          passos={resultado.passos}
        />
      ) : (
        <EmptyStateGrafo cor="purple" />
      )}
    </div>
  );
}

export function EmptyStateGrafo({ cor }: { cor: "purple" | "indigo" }) {
  const stroke = cor === "purple" ? "rgb(192 132 252)" : "rgb(129 140 248)";
  const fill = cor === "purple" ? "rgb(59 7 100)" : "rgb(49 46 129)";
  const text = cor === "purple" ? "rgb(233 213 255)" : "rgb(224 231 255)";
  const edges: [number, number, number, number][] = [
    [100, 30, 40, 90], [100, 30, 160, 90],
    [40, 90, 80, 160], [40, 90, 140, 160],
    [160, 90, 140, 160],
  ];
  const nodes = [
    { cx: 100, cy: 30, v: "A" },
    { cx: 40, cy: 90, v: "B" },
    { cx: 160, cy: 90, v: "C" },
    { cx: 80, cy: 160, v: "D" },
    { cx: 140, cy: 160, v: "E" },
  ];
  return (
    <div className="rounded-lg border border-slate-700 bg-[#0d1117] p-6">
      <svg viewBox="0 0 200 190" className="w-full max-w-xs mx-auto">
        {edges.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth="1.5"
            opacity="0.3"
          />
        ))}
        {nodes.map((n) => (
          <g key={n.v}>
            <circle
              cx={n.cx}
              cy={n.cy}
              r={16}
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <text
              x={n.cx}
              y={n.cy + 4}
              textAnchor="middle"
              fill={text}
              fontSize="11"
              fontFamily="monospace"
            >
              {n.v}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-center text-slate-500 text-xs font-mono mt-3">
        aguardando cálculo...
      </p>
    </div>
  );
}
