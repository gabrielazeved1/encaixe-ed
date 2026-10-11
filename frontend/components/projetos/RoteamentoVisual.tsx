"use client";

import { useState, useMemo } from "react";
import type { ArestaRot, PassoDijkstra } from "@/lib/api";

type Props = {
  nos: string[];
  arestas: ArestaRot[];
  caminho: string[];
  custoTotal: number;
  passos: PassoDijkstra[];
  origem: string;
  destino: string;
};

type Ponto = { x: number; y: number };

function calcularPosicoes(nos: string[]): Record<string, Ponto> {
  const n = nos.length;
  const cx = 200, cy = 175, r = 145;
  const pos: Record<string, Ponto> = {};
  nos.forEach((no, i) => {
    const ang = (2 * Math.PI * i) / n - Math.PI / 2;
    pos[no] = { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
  });
  return pos;
}

function midpoint(a: Ponto, b: Ponto) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function GrafoSVG({
  nos,
  arestas,
  posicoes,
  caminho,
  passosVisiveis,
  passoAtual,
  origem,
  destino,
  mostrarCaminho,
}: {
  nos: string[];
  arestas: ArestaRot[];
  posicoes: Record<string, Ponto>;
  caminho: string[];
  passosVisiveis: PassoDijkstra[];
  passoAtual: PassoDijkstra | null;
  origem: string;
  destino: string;
  mostrarCaminho: boolean;
}) {
  const caminhoSet = useMemo(() => new Set(caminho), [caminho]);
  const visitadosSet = useMemo(
    () => new Set(passosVisiveis.map((p) => p.no)),
    [passosVisiveis]
  );
  const custoPorNo = useMemo(() => {
    const m: Record<string, number> = {};
    passosVisiveis.forEach((p) => { m[p.no] = p.custo_acumulado; });
    return m;
  }, [passosVisiveis]);

  const arestasNoCaminho = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < caminho.length - 1; i++) {
      s.add([caminho[i], caminho[i + 1]].sort().join("|"));
    }
    return s;
  }, [caminho]);

  const arestasDraw = useMemo(() => {
    const vistas = new Set<string>();
    return arestas.filter((a) => {
      const k = [a.origem, a.destino].sort().join("|");
      if (vistas.has(k)) return false;
      vistas.add(k);
      return true;
    });
  }, [arestas]);

  return (
    <svg viewBox="0 0 400 350" className="w-full max-w-md mx-auto">
      {arestasDraw.map((a) => {
        const pa = posicoes[a.origem];
        const pb = posicoes[a.destino];
        if (!pa || !pb) return null;
        const key = [a.origem, a.destino].sort().join("|");
        const emCaminho = mostrarCaminho && arestasNoCaminho.has(key);
        const mid = midpoint(pa, pb);
        const dx = pb.x - pa.x, dy = pb.y - pa.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ox = (-dy / len) * 10, oy = (dx / len) * 10;
        return (
          <g key={key}>
            <line
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={emCaminho ? "#a855f7" : "#334155"}
              strokeWidth={emCaminho ? 3 : 1.5}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <text
              x={mid.x + ox} y={mid.y + oy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fontFamily="ui-monospace, monospace"
              fill={emCaminho ? "#d8b4fe" : "#64748b"}
              className="select-none"
            >
              {a.custo}
            </text>
          </g>
        );
      })}

      {nos.map((no) => {
        const pos = posicoes[no];
        if (!pos) return null;
        const emCaminho = mostrarCaminho && caminhoSet.has(no);
        const visitado = visitadosSet.has(no);
        const atual = passoAtual?.no === no;
        const isOrigem = no === origem;
        const isDestino = no === destino;
        const custo = custoPorNo[no];

        let fill = "#1e293b", stroke = "#475569", textFill = "#94a3b8";
        if (emCaminho) { fill = "#3b0764"; stroke = "#a855f7"; textFill = "#e9d5ff"; }
        else if (atual) { fill = "#451a03"; stroke = "#f59e0b"; textFill = "#fde68a"; }
        else if (visitado) { fill = "#1e3a5f"; stroke = "#3b82f6"; textFill = "#93c5fd"; }

        return (
          <g key={no} className="transition-all duration-300">
            {(isOrigem || isDestino) && !emCaminho && (
              <circle cx={pos.x} cy={pos.y} r={26}
                fill="none"
                stroke={isOrigem ? "#22c55e" : "#f43f5e"}
                strokeWidth={1.5} strokeDasharray="4 3" opacity={0.8}
              />
            )}
            <circle cx={pos.x} cy={pos.y} r={20}
              fill={fill} stroke={stroke}
              strokeWidth={atual || emCaminho ? 2.5 : 1.5}
            />
            <text x={pos.x} y={pos.y + (custo !== undefined ? -3 : 1)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={11} fontFamily="ui-monospace, monospace"
              fontWeight="600" fill={textFill} className="select-none"
            >
              {no}
            </text>
            {custo !== undefined && (
              <text x={pos.x} y={pos.y + 9}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={8} fontFamily="ui-monospace, monospace"
                fill={emCaminho ? "#c084fc" : atual ? "#fcd34d" : "#60a5fa"}
                className="select-none"
              >
                {custo}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function RoteamentoVisual({
  nos, arestas, caminho, custoTotal, passos, origem, destino,
}: Props) {
  const [passo, setPasso] = useState(0);
  const posicoes = useMemo(() => calcularPosicoes(nos), [nos]);

  // O backend mistura passos de visita {no, custo_acumulado, via} com passos de
  // relaxamento {tipo:"relaxamento"}. Filtramos apenas as visitas de nó.
  const passosVisita = useMemo(
    () => passos.filter((p): p is PassoDijkstra => typeof (p as PassoDijkstra).no === "string"),
    [passos]
  );

  if (caminho.length === 0 || custoTotal < 0) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-500/40 px-4 py-3 text-center text-red-300 font-mono text-sm">
        Sem caminho entre origem e destino
      </div>
    );
  }

  const totalPassos = passosVisita.length;
  const passoFinal = passo >= totalPassos;
  const passosVisiveis = passoFinal ? passosVisita : passosVisita.slice(0, passo + 1);
  const passoAtual = passoFinal ? null : (passosVisita[passo] ?? null);
  const podeAvancar = passo < totalPassos;
  const podeVoltar = passo > 0;

  const stepDesc = passoFinal
    ? `Caminho ótimo encontrado: ${caminho.join(" → ")} · custo total ${custoTotal}`
    : passoAtual
      ? `Visitando ${passoAtual.no}${passoAtual.via ? ` (via ${passoAtual.via})` : " (origem)"}. Custo acumulado: ${passoAtual.custo_acumulado}.`
      : "";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-700 bg-[#0d1117] p-3 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-mono text-slate-500">
            Dijkstra · {passoFinal ? "caminho ótimo" : `passo ${passo + 1} de ${totalPassos}`}
          </span>
          {passoFinal && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/20 border border-purple-500/40 text-purple-300">
              custo total: {custoTotal}
            </span>
          )}
        </div>

        <GrafoSVG
          nos={nos} arestas={arestas} posicoes={posicoes}
          caminho={caminho} passosVisiveis={passosVisiveis}
          passoAtual={passoAtual} origem={origem} destino={destino}
          mostrarCaminho={passoFinal}
        />

        <div className="rounded border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-mono text-slate-300 min-h-[2.5rem]">
          {stepDesc}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button type="button" disabled={!podeVoltar}
            onClick={() => setPasso((p) => Math.max(0, p - 1))}
            className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono disabled:opacity-30 hover:border-slate-500 transition-colors"
          >
            ← anterior
          </button>
          <span className="flex gap-1">
            {Array.from({ length: totalPassos + 1 }, (_, i) => (
              <span key={i} onClick={() => setPasso(i)}
                className={`inline-block w-2 h-2 rounded-full cursor-pointer transition-colors ${
                  i === passo ? (i === totalPassos ? "bg-purple-400" : "bg-amber-400") : "bg-slate-700 hover:bg-slate-500"
                }`}
              />
            ))}
          </span>
          <button type="button" disabled={!podeAvancar}
            onClick={() => setPasso((p) => Math.min(totalPassos, p + 1))}
            className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono disabled:opacity-30 hover:border-slate-500 transition-colors"
          >
            próximo →
          </button>
        </div>

        <div className="flex flex-wrap gap-3 pt-1 border-t border-slate-800">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-green-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full border border-green-400 border-dashed" />
            origem
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-red-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full border border-red-400 border-dashed" />
            destino
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-900/50 border border-amber-400" />
            visitando agora
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-900/40 border border-blue-400" />
            já visitado
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-purple-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-900/40 border border-purple-400" />
            caminho ótimo
          </span>
        </div>
      </div>

      <details className="group rounded-lg border border-slate-700 bg-[#0d1117] overflow-hidden">
        <summary className="px-4 py-3 text-xs font-mono text-slate-400 cursor-pointer hover:text-slate-200 list-none flex items-center justify-between">
          Tabela de visitação (Dijkstra)
          <span className="text-slate-600 group-open:rotate-180 transition-transform">▾</span>
        </summary>
        <div className="border-t border-slate-800">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs border-b border-slate-700">
                  Ponto visitado
                </th>
                <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs border-b border-slate-700">
                  Menor custo
                </th>
                <th className="text-left px-3 py-2 font-mono text-slate-400 text-xs border-b border-slate-700">
                  Veio de
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {passosVisita.map((p, i) => {
                const emCaminho = caminho.includes(p.no);
                return (
                  <tr key={i} className={emCaminho ? "bg-purple-900/10" : ""}>
                    <td className={`px-3 py-1.5 font-mono text-sm ${emCaminho ? "text-purple-300" : "text-slate-300"}`}>
                      {emCaminho && <span className="mr-1 text-purple-400">★</span>}
                      {p.no}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-sm text-slate-300">{p.custo_acumulado}</td>
                    <td className="px-3 py-1.5 font-mono text-sm text-slate-500">{p.via ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
