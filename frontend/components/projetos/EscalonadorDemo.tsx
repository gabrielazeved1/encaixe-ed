"use client";

import { useState } from "react";
import { useEscalonador } from "@/hooks/useEscalonador";
import { EscalonadorVisual } from "@/components/projetos/EscalonadorVisual";
import { Processo } from "@/lib/api";

type LinhaProc = {
  id: string;
  nome: string;
  duracao: string;
  prioridade: string;
};

const INICIAIS: LinhaProc[] = [
  { id: "p1", nome: "P1", duracao: "6", prioridade: "3" },
  { id: "p2", nome: "P2", duracao: "4", prioridade: "1" },
  { id: "p3", nome: "P3", duracao: "8", prioridade: "5" },
];

export function EscalonadorDemo() {
  const [linhas, setLinhas] = useState<LinhaProc[]>(INICIAIS);
  const [algoritmo, setAlgoritmo] = useState<string>("round-robin");
  const [quantum, setQuantum] = useState<string>("4");

  const { resultado, loading, erro, simular } = useEscalonador();

  function atualizarLinha(idx: number, campo: keyof LinhaProc, valor: string) {
    setLinhas((prev) => {
      const copia = [...prev];
      copia[idx] = { ...copia[idx], [campo]: valor };
      return copia;
    });
  }

  function adicionar() {
    if (linhas.length >= 6) return;
    const n = linhas.length + 1;
    setLinhas([
      ...linhas,
      { id: `p${n}`, nome: `P${n}`, duracao: "4", prioridade: "5" },
    ]);
  }

  function remover(idx: number) {
    if (linhas.length <= 1) return;
    setLinhas((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const processos: Processo[] = linhas.map((l) => ({
      id: l.id,
      nome: l.nome,
      duracao: parseInt(l.duracao, 10) || 1,
      prioridade: parseInt(l.prioridade, 10) || 5,
    }));
    const q = parseInt(quantum, 10) || 4;
    await simular(processos, algoritmo, q);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6">
      <h2 className="text-base font-semibold text-white mb-5">
        Demonstração interativa
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="space-y-1">
          <div className="flex gap-2 items-center px-0.5">
            <span className="w-20 text-xs font-mono text-slate-500">nome</span>
            <span className="w-24 text-xs font-mono text-slate-500">
              duração (ms)
            </span>
            <span
              className={`w-24 text-xs font-mono transition-colors ${
                algoritmo === "prioridade" ? "text-slate-500" : "text-slate-700"
              }`}
            >
              prioridade{" "}
              {algoritmo === "prioridade" && (
                <span className="text-slate-600">(1 = maior)</span>
              )}
            </span>
          </div>
          {linhas.map((linha, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={linha.nome}
                onChange={(e) => atualizarLinha(i, "nome", e.target.value)}
                className="bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm w-20 focus:outline-none focus:border-green-500"
                placeholder="P1"
              />
              <input
                type="number"
                min={1}
                value={linha.duracao}
                onChange={(e) => atualizarLinha(i, "duracao", e.target.value)}
                className="bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm w-24 focus:outline-none focus:border-green-500"
                placeholder="ex: 4"
              />
              <input
                type="number"
                min={1}
                max={10}
                value={linha.prioridade}
                onChange={(e) => atualizarLinha(i, "prioridade", e.target.value)}
                className="bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm w-24 focus:outline-none focus:border-green-500 disabled:opacity-30"
                placeholder="1–10"
                disabled={algoritmo !== "prioridade"}
              />
              <button
                type="button"
                onClick={() => remover(i)}
                disabled={linhas.length <= 1}
                className="text-slate-500 hover:text-red-400 disabled:opacity-30 text-sm px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <button
            type="button"
            onClick={adicionar}
            disabled={linhas.length >= 6}
            className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
          >
            + processo
          </button>
          <select
            value={algoritmo}
            onChange={(e) => setAlgoritmo(e.target.value)}
            className="bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-500"
          >
            <option value="round-robin">round-robin</option>
            <option value="prioridade">prioridade</option>
          </select>
          <input
            type="number"
            min={1}
            value={quantum}
            onChange={(e) => setQuantum(e.target.value)}
            className="bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm w-24 focus:outline-none focus:border-green-500"
            placeholder="quantum"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg px-5 py-1.5 text-sm font-medium transition-colors"
          >
            {loading ? "Simulando…" : "Simular"}
          </button>
        </div>
      </form>

      {erro && <p className="text-red-400 text-sm mb-4">{erro}</p>}

      {resultado ? (
        <EscalonadorVisual
          gantt={resultado.gantt}
          tempoTotal={resultado.tempo_total}
        />
      ) : (
        <EmptyStateEscalonador />
      )}
    </div>
  );
}

function EmptyStateEscalonador() {
  const pills = [
    { id: "p1", nome: "P1", cor: "bg-green-500" },
    { id: "p2", nome: "P2", cor: "bg-blue-500" },
    { id: "p3", nome: "P3", cor: "bg-purple-500" },
  ];
  return (
    <div className="rounded-lg border border-slate-700 bg-[#0d1117] p-8 space-y-4">
      <div className="text-center text-slate-500 text-sm font-mono">
        fila de processos
      </div>
      <div className="flex justify-center gap-2">
        {pills.map((p, i) => (
          <div
            key={p.id}
            className={`${p.cor} text-white text-sm font-mono px-4 py-2 rounded shadow-sm`}
            style={{ animation: `edSeq 3s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
          >
            {p.nome}
          </div>
        ))}
      </div>
      <div className="text-center text-slate-600 text-xs font-mono">
        aguardando quantum...
      </div>
    </div>
  );
}
