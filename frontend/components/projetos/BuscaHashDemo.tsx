"use client";

import { useState, useMemo } from "react";
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
  for (const c of chave) h = (h * 31 + c.charCodeAt(0)) % tamanho;
  return h;
}

function construirTabela(): [string, string][][] {
  const buckets: [string, string][][] = Array.from({ length: 16 }, () => []);
  for (const { chave, valor } of LINGUAGENS) {
    buckets[computeHash(chave)].push([chave, valor as string]);
  }
  return buckets;
}

export function BuscaHashDemo() {
  const [chave, setChave] = useState<string>("rust");
  const { resultado, loading, erro, simular } = useBuscaHash();

  const tabelaPreview = useMemo(() => construirTabela(), []);
  const bucketAlvo = chave.trim() ? computeHash(chave.trim()) : null;
  const chaveExiste = LINGUAGENS.some((l) => l.chave === chave.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chave.trim()) return;
    await simular(chave.trim(), LINGUAGENS);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white mb-2">
          Demonstração interativa
        </h2>
        <div className="rounded-lg border border-orange-500/20 bg-orange-900/10 px-4 py-3 text-xs text-slate-300 leading-relaxed space-y-1">
          <p>
            <span className="text-orange-300 font-semibold">Busca linear</span>{" "}
            percorre a lista do início ao fim até encontrar o item — no pior
            caso, compara com todos os 16 itens.
          </p>
          <p>
            <span className="text-blue-300 font-semibold">Hash table</span> usa
            uma fórmula matemática para calcular diretamente em qual{" "}
            <span className="text-white">gaveta (bucket)</span> o item está —
            geralmente encontra em 1 ou 2 comparações, independente do tamanho.
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-mono text-slate-500 mb-2">
          16 linguagens armazenadas · clique para buscar:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LINGUAGENS.map((l) => {
            const bucket = computeHash(l.chave);
            return (
              <button key={l.chave} type="button" onClick={() => setChave(l.chave)}
                title={`bucket [${bucket}]`}
                className={`rounded px-2 py-0.5 text-xs font-mono transition-colors ${
                  chave === l.chave
                    ? "bg-orange-500/30 border border-orange-400/60 text-orange-200"
                    : "bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                {l.chave}
              </button>
            );
          })}
        </div>
      </div>

      <TabelaHashPreview
        buckets={tabelaPreview}
        bucketAlvo={resultado ? resultado.hash.indice : bucketAlvo}
        chaveAlvo={chave.trim()}
        buscaRealizada={!!resultado}
      />

      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Chave para buscar
            </label>
            <div className="flex gap-2">
              <input
                type="text" value={chave}
                onChange={(e) => setChave(e.target.value)}
                className="flex-1 bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-orange-500"
                placeholder="ex: rust"
              />
              <button type="submit" disabled={loading}
                className="shrink-0 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
              >
                {loading ? "Buscando…" : "Buscar"}
              </button>
            </div>
          </div>
        </div>
        {bucketAlvo !== null && (
          <p className="text-xs font-mono mt-2 text-slate-500">
            h(<span className="text-orange-300">&quot;{chave}&quot;</span>) ={" "}
            <span className="text-blue-300">bucket [{bucketAlvo}]</span>
            {!chaveExiste && (
              <span className="ml-2 text-amber-400">(não está na tabela)</span>
            )}
          </p>
        )}
      </form>

      {erro && <p className="text-red-400 text-sm">{erro}</p>}

      {resultado && (
        <ResultadoBusca resultado={resultado} chave={chave} />
      )}
    </div>
  );
}

function TabelaHashPreview({
  buckets,
  bucketAlvo,
  chaveAlvo,
  buscaRealizada,
}: {
  buckets: [string, string][][];
  bucketAlvo: number | null;
  chaveAlvo: string;
  buscaRealizada: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-mono text-slate-500">
        tabela hash · 16 gavetas (buckets) · encadeamento separado
      </p>
      <div className="grid grid-cols-8 gap-1">
        {buckets.map((bucket, idx) => {
          const alvo = bucketAlvo === idx;
          const temChaveAlvo = bucket.some(([k]) => k === chaveAlvo);
          return (
            <div key={idx}
              className={`flex min-h-[3.5rem] flex-col rounded border text-[9px] font-mono transition-all duration-200 overflow-hidden ${
                alvo && buscaRealizada
                  ? "border-blue-400 bg-blue-900/50 ring-2 ring-blue-500/30"
                  : alvo
                    ? "border-orange-400/60 bg-orange-900/20"
                    : bucket.length > 0
                      ? "border-slate-600 bg-slate-900/50"
                      : "border-slate-800 bg-slate-950/30"
              }`}
            >
              <div className={`px-1 py-0.5 text-center text-[8px] border-b ${
                alvo ? "border-orange-500/30 text-orange-400" : "border-slate-800 text-slate-600"
              }`}>
                [{idx}]
              </div>
              <div className="flex-1 flex flex-col gap-0.5 p-0.5">
                {bucket.length === 0 ? (
                  <span className="text-center text-slate-700 mt-1">—</span>
                ) : (
                  bucket.map(([k]) => (
                    <span key={k}
                      className={`truncate rounded px-1 py-0.5 ${
                        k === chaveAlvo && buscaRealizada
                          ? "bg-blue-700/60 text-blue-100"
                          : k === chaveAlvo
                            ? "bg-orange-700/40 text-orange-200"
                            : "bg-slate-800/60 text-slate-400"
                      }`}
                      title={k}
                    >
                      {k}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BuscaLinearVisual({ chave, comparacoes, encontrado }: {
  chave: string;
  comparacoes: number;
  encontrado: boolean;
}) {
  const itens = LINGUAGENS.map((l) => l.chave);
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-mono text-slate-500">
        busca linear · percorrendo na ordem de inserção:
      </p>
      <div className="flex flex-wrap gap-1">
        {itens.map((item, i) => {
          const posicao = i + 1;
          const eAlvo = item === chave;
          const foiVerificado = posicao <= comparacoes;
          const eNaoEncontrado = foiVerificado && !eAlvo && !encontrado;

          if (!foiVerificado) {
            return (
              <span key={item}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-600"
              >
                {item}
              </span>
            );
          }
          if (eAlvo && encontrado) {
            return (
              <span key={item}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-green-900/50 border border-green-500/60 text-green-300 font-bold"
                title={`${posicao}ª comparação — encontrado`}
              >
                {item} ✓
              </span>
            );
          }
          return (
            <span key={item}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-600 line-through"
              title={`${posicao}ª comparação — não é`}
            >
              {item}
            </span>
          );
        })}
      </div>
      <p className="text-[10px] font-mono text-slate-500">
        {encontrado
          ? `"${chave}" estava na posição ${comparacoes} da lista → ${comparacoes} comparações`
          : `"${chave}" não está na lista → percorreu todos os ${comparacoes} itens`}
      </p>
    </div>
  );
}

function MapeamentoHash({ chave }: { chave: string }) {
  const itens = LINGUAGENS.map((l) => l.chave);
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-mono text-slate-500">
        como a função hash distribui cada linguagem:
        <span className="ml-1 text-slate-600">h(chave) = (31·h + ord(c)) % 16</span>
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {itens.map((item) => {
          const bucket = computeHash(item);
          const eAlvo = item === chave;
          return (
            <div key={item}
              className={`flex items-center gap-2 py-0.5 px-1.5 rounded text-[10px] font-mono ${
                eAlvo ? "bg-blue-900/30 border border-blue-500/30" : ""
              }`}
            >
              <span className={`w-20 truncate ${eAlvo ? "text-orange-300 font-bold" : "text-slate-400"}`}>
                {item}
              </span>
              <span className="text-slate-600">→</span>
              <span className={`w-6 text-center ${eAlvo ? "text-blue-300 font-bold" : "text-slate-500"}`}>
                [{bucket}]
              </span>
              {eAlvo && <span className="text-[9px] text-blue-400">← aqui</span>}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] font-mono text-slate-600">
        cada chave vai diretamente para seu bucket — sem percorrer a lista
      </p>
    </div>
  );
}

function ResultadoBusca({
  resultado,
  chave,
}: {
  resultado: ReturnType<typeof useBuscaHash>["resultado"];
  chave: string;
}) {
  const [aba, setAba] = useState<"linear" | "hash">("linear");
  if (!resultado) return null;
  const { linear, hash } = resultado;
  const max = Math.max(linear.comparacoes, hash.comparacoes, 1);
  const ratio = hash.comparacoes > 0
    ? (linear.comparacoes / hash.comparacoes).toFixed(1)
    : "∞";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setAba("linear")}
          className={`rounded-lg border p-3 space-y-2 text-left transition-colors ${
            aba === "linear"
              ? "border-orange-500/60 bg-orange-900/20"
              : "border-orange-500/20 bg-[#0d1117] hover:border-orange-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Busca Linear
            </span>
            <span className="font-mono text-[10px] text-slate-500">O(n)</span>
          </div>
          <div className="font-mono">
            <span className="text-2xl font-bold text-orange-300">{linear.comparacoes}</span>
            <span className="ml-1.5 text-xs text-slate-500">comparações</span>
          </div>
          <div className="h-1.5 rounded bg-slate-800 overflow-hidden">
            <div className="h-full bg-orange-500 transition-all"
              style={{ width: `${(linear.comparacoes / max) * 100}%` }} />
          </div>
          <p className="text-[10px] font-mono text-orange-400/70">
            {aba === "linear" ? "▾ ver percurso" : "clique para ver"}
          </p>
        </button>

        <button type="button" onClick={() => setAba("hash")}
          className={`rounded-lg border p-3 space-y-2 text-left transition-colors ${
            aba === "hash"
              ? "border-blue-500/60 bg-blue-900/20"
              : "border-blue-500/20 bg-[#0d1117] hover:border-blue-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Hash Table
            </span>
            <span className="font-mono text-[10px] text-slate-500">O(1)</span>
          </div>
          <div className="font-mono">
            <span className="text-2xl font-bold text-blue-300">{hash.comparacoes}</span>
            <span className="ml-1.5 text-xs text-slate-500">comparações</span>
          </div>
          <div className="h-1.5 rounded bg-slate-800 overflow-hidden">
            <div className="h-full bg-blue-500 transition-all"
              style={{ width: `${(hash.comparacoes / max) * 100}%` }} />
          </div>
          <p className="text-[10px] font-mono text-blue-400/70">
            {aba === "hash" ? "▾ ver mapeamento" : "clique para ver"}
          </p>
        </button>
      </div>

      {hash.comparacoes < linear.comparacoes && (
        <div className="rounded-lg border border-green-500/40 bg-green-900/20 px-4 py-2 text-center font-mono text-sm text-green-300">
          hash {ratio}× mais rápido nesta busca
        </div>
      )}

      <div className="rounded-lg border border-slate-700 bg-[#0d1117] p-3">
        {aba === "linear" ? (
          <BuscaLinearVisual
            chave={chave}
            comparacoes={linear.comparacoes}
            encontrado={linear.encontrado}
          />
        ) : (
          <MapeamentoHash chave={chave} />
        )}
      </div>
    </div>
  );
}
