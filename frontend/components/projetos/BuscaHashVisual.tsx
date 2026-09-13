"use client";

import { BuscaHashResult } from "@/lib/api";

type Props = {
  resultado: BuscaHashResult;
  chave: string;
};

export function BuscaHashVisual({ resultado, chave }: Props) {
  const { linear, hash } = resultado;
  const max = Math.max(linear.comparacoes, hash.comparacoes, 1);
  const ratio =
    hash.comparacoes > 0
      ? (linear.comparacoes / hash.comparacoes).toFixed(1)
      : "∞";

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-[#0d1117] border border-slate-700 p-4 text-sm">
        <p className="text-slate-400">
          Buscando por{" "}
          <span className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded">
            {chave}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg bg-[#0d1117] border border-orange-500/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-orange-400">
              Busca Linear
            </span>
            <span className="font-mono text-xs text-slate-500">O(n)</span>
          </div>
          <div className="font-mono">
            <span className="text-4xl font-bold text-orange-300">
              {linear.comparacoes}
            </span>
            <span className="text-slate-500 text-sm ml-2">comparações</span>
          </div>
          <div className="h-2 bg-slate-800 rounded overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${(linear.comparacoes / max) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 font-mono">
            {linear.encontrado ? "encontrado" : "não encontrado"}
          </p>
        </div>

        <div className="rounded-lg bg-[#0d1117] border border-blue-500/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">
              Hash Table
            </span>
            <span className="font-mono text-xs text-slate-500">O(1)</span>
          </div>
          <div className="font-mono">
            <span className="text-4xl font-bold text-blue-300">
              {hash.comparacoes}
            </span>
            <span className="text-slate-500 text-sm ml-2">comparações</span>
          </div>
          <div className="h-2 bg-slate-800 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(hash.comparacoes / max) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 font-mono">
            índice: {hash.indice}
            {" · "}
            {hash.encontrado ? "encontrado" : "não encontrado"}
          </p>
        </div>
      </div>

      {hash.comparacoes < linear.comparacoes && (
        <div className="rounded-lg bg-green-900/20 border border-green-500/40 px-4 py-2.5 text-center font-mono text-sm text-green-300">
          hash {ratio}× mais rápido que linear
        </div>
      )}
    </div>
  );
}
