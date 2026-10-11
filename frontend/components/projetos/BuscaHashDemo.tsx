"use client";

import { useState } from "react";
import { useBuscaHash } from "@/hooks/useBuscaHash";
import { BuscaHashVisual } from "@/components/projetos/BuscaHashVisual";
import type { EntradaHash } from "@/lib/api";

const LINGUAGENS: EntradaHash[] = [
  "python", "java", "javascript", "typescript", "rust",
  "go", "swift", "kotlin", "ruby", "php",
  "c", "cpp", "scala", "haskell", "elixir", "dart",
].map((lang, i) => ({ chave: lang, valor: `linguagem #${i + 1}` }));

function computeHash(chave: string, tamanho = 16): number {
  let h = 0;
  for (const c of chave) {
    h = (h * 31 + c.charCodeAt(0)) % tamanho;
  }
  return h;
}

export function BuscaHashDemo() {
  const [chave, setChave] = useState<string>("rust");
  const { resultado, loading, erro, simular } = useBuscaHash();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chave.trim()) return;
    await simular(chave.trim(), LINGUAGENS);
  }

  const bucketPreview = chave.trim() ? computeHash(chave.trim()) : null;
  const chaveExiste = LINGUAGENS.some((l) => l.chave === chave.trim());

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">
          Demonstração interativa
        </h2>
        <p className="text-xs text-slate-400">
          Tabela hash com{" "}
          <span className="font-mono text-orange-300">16 buckets</span> e{" "}
          <span className="font-mono text-orange-300">encadeamento separado</span>.
          Cada chave é mapeada pela fórmula{" "}
          <span className="font-mono text-slate-300">
            h(c) = (31·h + ord(c)) % 16
          </span>
          , aplicada caractere a caractere.
        </p>
      </div>

      <div>
        <p className="text-xs font-mono text-slate-500 mb-2">
          16 linguagens na tabela — clique para selecionar:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LINGUAGENS.map((l) => (
            <button
              key={l.chave}
              type="button"
              onClick={() => setChave(l.chave)}
              className={`rounded px-2 py-0.5 text-xs font-mono transition-colors ${
                chave === l.chave
                  ? "bg-orange-500/30 border border-orange-400/60 text-orange-200"
                  : "bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {l.chave}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Chave para buscar
            </label>
            <input
              type="text"
              value={chave}
              onChange={(e) => setChave(e.target.value)}
              className="w-full bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-orange-500"
              placeholder="ex: rust"
            />
          </div>
          {bucketPreview !== null && (
            <div className="rounded-lg border border-slate-700 bg-[#0d1117] px-4 py-2 text-sm font-mono">
              <span className="text-slate-500">h(</span>
              <span className="text-orange-300">&quot;{chave}&quot;</span>
              <span className="text-slate-500">) = bucket </span>
              <span className="text-blue-300 font-bold">[{bucketPreview}]</span>
              {!chaveExiste && (
                <span className="ml-2 text-amber-400 text-xs">(não está na tabela)</span>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
          >
            {loading ? "Buscando…" : "Buscar"}
          </button>
        </div>
      </form>

      {erro && <p className="text-red-400 text-sm">{erro}</p>}

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
  const slots = [
    { idx: 0, chave: "go" },
    { idx: 1, chave: null },
    { idx: 2, chave: "java" },
    { idx: 3, chave: "rust" },
    { idx: 4, chave: null },
    { idx: 5, chave: "php" },
    { idx: 6, chave: null },
    { idx: 7, chave: "c" },
    { idx: 8, chave: null },
    { idx: 9, chave: "python" },
    { idx: 10, chave: null },
    { idx: 11, chave: "dart" },
    { idx: 12, chave: "swift" },
    { idx: 13, chave: null },
    { idx: 14, chave: "kotlin" },
    { idx: 15, chave: null },
  ];
  return (
    <div className="rounded-lg border border-slate-700 bg-[#0d1117] p-4 space-y-3">
      <p className="text-xs font-mono text-slate-500">
        hash table · 16 buckets · encadeamento separado
      </p>
      <div className="grid grid-cols-8 gap-1">
        {slots.map(({ idx, chave }) => (
          <div
            key={idx}
            className={`h-14 flex flex-col items-center justify-center rounded border text-[9px] font-mono ${
              chave === null
                ? "border-slate-800 bg-slate-950/50 text-slate-700"
                : "border-orange-500/30 bg-orange-900/20 text-orange-300"
            }`}
          >
            <span className="text-[8px] text-slate-600">[{idx}]</span>
            {chave !== null && <span className="mt-0.5">{chave}</span>}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-600 text-center font-mono">
        selecione uma chave acima e clique em Buscar
      </p>
    </div>
  );
}
