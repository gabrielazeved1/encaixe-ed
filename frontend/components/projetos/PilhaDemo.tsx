"use client";

import { useState } from "react";
import { usePilhaSimulacao } from "@/hooks/usePilhaSimulacao";
import { PilhaVisual } from "@/components/projetos/PilhaVisual";
import { StackAnimation } from "@/components/ui/StackAnimation";

const FUNCOES = ["fatorial", "fibonacci"] as const;

export function PilhaDemo() {
  const [funcao, setFuncao] = useState<string>("fatorial");
  const [valorInput, setValorInput] = useState<string>("5");
  const [eventoAtual, setEventoAtual] = useState(0);

  const { resultado, loading, erro, simular } = usePilhaSimulacao();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = parseInt(valorInput, 10);
    if (isNaN(v) || v < 1) return;
    setEventoAtual(0);
    await simular(funcao, v);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6">
      <h2 className="text-base font-semibold text-white mb-5">
        Demonstração interativa
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div className="flex gap-2 items-center px-0.5">
          <span className="text-xs font-mono text-slate-500 w-36">função</span>
          <span className="text-xs font-mono text-slate-500">
            n{" "}
            <span className="text-slate-600">(overflow se n &gt; 50)</span>
          </span>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            className="bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm w-36 focus:outline-none focus:border-blue-500 transition-colors"
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
            className="bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm w-24 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="ex: 5"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
          >
            {loading ? "Simulando…" : "Simular"}
          </button>
        </div>
      </form>

      {erro && <p className="text-red-400 text-sm mb-4">{erro}</p>}

      {resultado ? (
        <div className="space-y-4">
          <PilhaVisual
            frames={resultado.frames}
            status={resultado.status}
            eventoAtual={eventoAtual}
          />

          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => setEventoAtual((n) => Math.max(0, n - 1))}
              disabled={eventoAtual === 0}
              className="px-4 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 transition-colors"
            >
              ← anterior
            </button>
            <button
              onClick={() =>
                setEventoAtual((n) =>
                  Math.min(resultado.frames.length - 1, n + 1)
                )
              }
              disabled={eventoAtual === resultado.frames.length - 1}
              className="px-4 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 transition-colors"
            >
              próximo →
            </button>
          </div>
        </div>
      ) : (
        <StackAnimation />
      )}
    </div>
  );
}
