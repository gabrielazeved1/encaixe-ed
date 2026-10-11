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
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white mb-3">
          Demonstração interativa
        </h2>
        <div className="rounded-lg border border-blue-500/20 bg-blue-900/10 px-4 py-3 text-xs text-slate-300 leading-relaxed space-y-1">
          <p>
            <span className="text-blue-300 font-semibold">Como funciona:</span>{" "}
            cada vez que uma função chama outra, um{" "}
            <span className="text-white">frame</span> é{" "}
            <span className="text-blue-300">empilhado</span> (push) com o nome
            e o argumento. Quando a função retorna, o frame é{" "}
            <span className="text-blue-300">desempilhado</span> (pop) com o
            resultado. Funções recursivas se chamam repetidamente — cada chamada
            empilha mais um frame.
          </p>
          <p>
            Se a recursão for funda demais (tente{" "}
            <span className="text-white font-mono">fibonacci(51)</span>
            ), a pilha estoura — é o{" "}
            <span className="text-white">stack overflow</span>. Limite aqui: 50
            frames.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
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

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      {resultado ? (
        <PilhaVisual passos={resultado.passos} />
      ) : (
        <StackAnimation />
      )}
    </div>
  );
}
