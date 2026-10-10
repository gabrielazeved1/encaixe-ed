"use client";

import type { VereditoResult } from "@/lib/api";

type Props = {
  veredito: VereditoResult;
  onProxima?: () => void;
};

const ROTULOS: Record<VereditoResult["estrutura_correta"], string> = {
  pilha: "Pilha",
  fila: "Fila",
  heap: "Heap",
  hash: "Hash",
  bst: "BST",
  linkedlist: "LinkedList",
  grafo: "Grafo",
};

export function Veredito({ veredito, onProxima }: Props) {
  const { acertou, estrutura_correta, explicacao } = veredito;
  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border p-5 ${
        acertou
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-amber-500/40 bg-amber-500/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg ${
            acertou
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-amber-500/20 text-amber-300"
          }`}
          aria-hidden
        >
          {acertou ? "✓" : "✕"}
        </span>
        <div>
          <p className="text-sm uppercase tracking-wider text-white/60">
            {acertou ? "Acertou" : "Errou"}
          </p>
          <p className="text-lg font-semibold text-white">
            {ROTULOS[estrutura_correta]}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-white/80">{explicacao}</p>

      {onProxima && (
        <button
          type="button"
          onClick={onProxima}
          className="self-start rounded-lg border border-blue-500/60 bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-100 transition hover:border-blue-400 hover:bg-blue-500/30"
        >
          Próxima rodada →
        </button>
      )}
    </div>
  );
}
