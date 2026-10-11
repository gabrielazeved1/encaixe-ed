"use client";

import { useMemo, useState } from "react";
import { useRoteamento } from "@/hooks/useRoteamento";
import { RoteamentoVisual } from "@/components/projetos/RoteamentoVisual";
import { ArestaRot } from "@/lib/api";

const PRESET_NOS = ["SP", "RJ", "BH", "CWB", "POA"];
const PRESET_ARESTAS: ArestaRot[] = [
  { origem: "SP", destino: "RJ", custo: 430 },
  { origem: "SP", destino: "BH", custo: 590 },
  { origem: "SP", destino: "CWB", custo: 410 },
  { origem: "RJ", destino: "BH", custo: 440 },
  { origem: "BH", destino: "CWB", custo: 990 },
  { origem: "CWB", destino: "POA", custo: 710 },
];

const ARESTAS_TEXTO_INICIAL = PRESET_ARESTAS.map(
  (a) => `${a.origem}-${a.destino}:${a.custo}`
).join("\n");

function parseArestas(texto: string): ArestaRot[] {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap((l) => {
      const m = l.match(/^([A-Za-z0-9_]+)\s*-\s*([A-Za-z0-9_]+)\s*:\s*(\d+)$/);
      return m ? [{ origem: m[1], destino: m[2], custo: parseInt(m[3], 10) }] : [];
    });
}

export function RoteamentoDemo() {
  const [nosTexto, setNosTexto] = useState(PRESET_NOS.join(","));
  const [arestasTexto, setArestasTexto] = useState(ARESTAS_TEXTO_INICIAL);
  const [origem, setOrigem] = useState("SP");
  const [destino, setDestino] = useState("POA");
  const [editando, setEditando] = useState(false);

  const { resultado, loading, erro, simular } = useRoteamento();

  const nos = useMemo(
    () => nosTexto.split(",").map((n) => n.trim()).filter(Boolean),
    [nosTexto]
  );

  const arestas = useMemo(() => parseArestas(arestasTexto), [arestasTexto]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await simular(nos, arestas, origem, destino);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">
          Demonstração interativa
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          O algoritmo de{" "}
          <span className="text-purple-300 font-medium">Dijkstra</span> encontra o
          caminho de{" "}
          <span className="text-white">menor custo total</span> entre dois pontos
          de uma rede. A cada passo ele escolhe o ponto mais barato ainda não
          visitado — por isso garante o ótimo global.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Origem
            </label>
            <select
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="w-full bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              {nos.map((n) => (
                <option key={n} value={n}>{n}</option>
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
              className="w-full bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              {nos.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
          >
            {loading ? "Calculando…" : "Calcular rota"}
          </button>
          <button
            type="button"
            onClick={() => setEditando((v) => !v)}
            className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
          >
            {editando ? "← ocultar grafo" : "Editar grafo →"}
          </button>
        </div>

        {editando && (
          <div className="space-y-3 rounded-lg border border-slate-700 bg-[#0d1117] p-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Pontos{" "}
                <span className="text-slate-600">— separados por vírgula</span>
              </label>
              <input
                type="text"
                value={nosTexto}
                onChange={(e) => setNosTexto(e.target.value)}
                className="w-full bg-[#161b27] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                placeholder="A,B,C,D"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Conexões{" "}
                <span className="text-slate-600">— uma por linha:</span>{" "}
                <span className="text-purple-400 font-mono">A-B:custo</span>
              </label>
              <textarea
                value={arestasTexto}
                onChange={(e) => setArestasTexto(e.target.value)}
                rows={4}
                className="w-full bg-[#161b27] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}
      </form>

      {erro && <p className="text-red-400 text-sm">{erro}</p>}

      {resultado ? (
        <RoteamentoVisual
          nos={nos}
          arestas={arestas}
          caminho={resultado.caminho}
          custoTotal={resultado.custo_total}
          passos={resultado.passos}
          origem={origem}
          destino={destino}
        />
      ) : (
        <EmptyStateGrafo nos={nos} arestas={arestas} />
      )}
    </div>
  );
}

export function EmptyStateGrafo({
  nos,
  arestas,
  cor = "purple",
}: {
  nos?: string[];
  arestas?: ArestaRot[];
  cor?: "purple" | "indigo";
}) {
  const displayNos = nos ?? PRESET_NOS;
  const displayArestas = arestas ?? PRESET_ARESTAS;

  const n = displayNos.length;
  const cx = 130, cy = 100, r = 80;
  const posicoes: Record<string, { x: number; y: number }> = {};
  displayNos.forEach((no, i) => {
    const ang = (2 * Math.PI * i) / n - Math.PI / 2;
    posicoes[no] = { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
  });

  const stroke = cor === "purple" ? "#a855f7" : "#818cf8";
  const fillNode = cor === "purple" ? "#3b0764" : "#312e81";
  const textCol = cor === "purple" ? "#e9d5ff" : "#e0e7ff";

  const vistas = new Set<string>();
  const arestasUnicas = displayArestas.filter((a) => {
    const k = [a.origem, a.destino].sort().join("|");
    if (vistas.has(k)) return false;
    vistas.add(k);
    return true;
  });

  return (
    <div className="rounded-lg border border-slate-700 bg-[#0d1117] p-4 space-y-2">
      <p className="text-xs font-mono text-slate-500 text-center">
        {cor === "purple" ? "grafo ponderado · Dijkstra" : "grafo não ponderado · BFS"}
      </p>
      <svg viewBox="0 0 260 200" className="w-full max-w-xs mx-auto">
        {arestasUnicas.map((a) => {
          const pa = posicoes[a.origem];
          const pb = posicoes[a.destino];
          if (!pa || !pb) return null;
          const key = [a.origem, a.destino].sort().join("|");
          const mid = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
          const dx = pb.x - pa.x, dy = pb.y - pa.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ox = (-dy / len) * 8, oy = (dx / len) * 8;
          return (
            <g key={key}>
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={stroke} strokeWidth="1.5" opacity="0.25"
              />
              {cor === "purple" && (
                <text x={mid.x + ox} y={mid.y + oy}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={8} fontFamily="ui-monospace, monospace"
                  fill="#64748b"
                >
                  {a.custo}
                </text>
              )}
            </g>
          );
        })}
        {displayNos.map((no) => {
          const pos = posicoes[no];
          if (!pos) return null;
          return (
            <g key={no}>
              <circle cx={pos.x} cy={pos.y} r={16}
                fill={fillNode} stroke={stroke} strokeWidth="1.5" opacity="0.5"
              />
              <text x={pos.x} y={pos.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fontFamily="ui-monospace, monospace"
                fill={textCol} opacity="0.7"
              >
                {no}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-center text-slate-600 text-xs font-mono">
        selecione origem e destino, clique em Calcular rota
      </p>
    </div>
  );
}
