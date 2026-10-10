"use client";

import { useState } from "react";
import { useBuscaHash } from "@/hooks/useBuscaHash";
import { BuscaHashVisual } from "@/components/projetos/BuscaHashVisual";

export function BuscaHashDemo() {
  const [chave, setChave] = useState<string>("registro_015");
  const { resultado, loading, erro, simular } = useBuscaHash();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chave.trim()) return;
    await simular(chave.trim());
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6">
      <h2 className="text-base font-semibold text-white mb-5">
        Demonstração interativa
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Chave para buscar{" "}
            <span className="text-slate-600">
              — base tem registro_001 a registro_020
            </span>
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={chave}
              onChange={(e) => setChave(e.target.value)}
              className="flex-1 min-w-40 bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-orange-500"
              placeholder="ex: registro_015"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
            >
              {loading ? "Buscando…" : "Comparar"}
            </button>
          </div>
        </div>
      </form>

      {erro && <p className="text-red-400 text-sm mb-4">{erro}</p>}

      {resultado ? (
        <BuscaHashVisual
          passos={resultado.passos}
          resumo={resultado}
          chave={chave}
        />
      ) : (
        <EmptyStateHash />
      )}
    </div>
  );
}

function EmptyStateHash() {
  const cells = ["registro_003", "", "registro_007", "registro_012", "", "registro_015", "", "registro_020"];
  return (
    <div className="rounded-lg border border-slate-700 bg-[#0d1117] p-6">
      <p className="text-center text-slate-500 text-xs font-mono mb-4">
        hash table · acesso O(1)
      </p>
      <div className="grid grid-cols-8 gap-1">
        {cells.map((v, i) => {
          const empty = v === "";
          return (
            <div
              key={i}
              className={`h-16 flex flex-col items-center justify-center rounded border text-[9px] font-mono ${
                empty
                  ? "border-slate-800 bg-slate-950/50 text-slate-700"
                  : "border-orange-500/40 bg-orange-900/30 text-orange-200"
              }`}
            >
              <span className="text-slate-600 text-[8px]">[{i}]</span>
              {!empty && <span className="mt-1 truncate w-full text-center px-0.5">{v}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
