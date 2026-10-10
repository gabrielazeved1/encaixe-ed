"use client";

import { useState } from "react";
import { usePilhaSimulacao } from "@/hooks/usePilhaSimulacao";
import { PilhaVisual } from "@/components/projetos/PilhaVisual";
import { StackAnimation } from "@/components/ui/StackAnimation";

const FUNCOES = ["fatorial", "fibonacci"] as const;

export function PilhaDemo() {
  const [funcao, setFuncao] = useState<string>("fatorial");
  const [valorInput, setValorInput] = useState<string>("5");

  const { resultado, loading, erro, simular } = usePilhaSimulacao();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = parseInt(valorInput, 10);
    if (isNaN(v) || v < 1) return;
    await simular(funcao, v);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6">
      <h2 className="mb-5 text-base font-semibold text-white">
        Demonstração interativa
      </h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <span className="w-36 font-mono text-xs text-slate-500">função</span>
          <span className="font-mono text-xs text-slate-500">
            n <span className="text-slate-600">(overflow se n &gt; 50)</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            className="w-36 rounded-lg border border-slate-700 bg-[#0d1117] px-3 py-2 text-sm text-white transition-colors focus:border-blue-500 focus:outline-none"
          >
            {FUNCOES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            value={valorInput}
            onChange={(e) => setValorInput(e.target.value)}
            className="w-24 rounded-lg border border-slate-700 bg-[#0d1117] px-3 py-2 text-sm text-white transition-colors focus:border-blue-500 focus:outline-none"
            placeholder="ex: 5"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Simulando…" : "Simular"}
          </button>
        </div>
      </form>

      {erro && <p className="mb-4 text-sm text-red-400">{erro}</p>}

      {resultado ? (
        <PilhaVisual passos={resultado.passos} />
      ) : (
        <StackAnimation />
      )}
    </div>
  );
}
