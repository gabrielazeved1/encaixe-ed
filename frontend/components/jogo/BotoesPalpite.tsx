"use client";

import type { Estrutura } from "@/lib/api";

type Props = {
  onPalpite: (e: Estrutura) => void;
  desabilitado: boolean;
};

const OPCOES: { valor: Estrutura; rotulo: string }[] = [
  { valor: "pilha", rotulo: "Pilha" },
  { valor: "fila", rotulo: "Fila" },
  { valor: "heap", rotulo: "Heap" },
  { valor: "hash", rotulo: "Hash" },
  { valor: "bst", rotulo: "BST" },
  { valor: "linkedlist", rotulo: "LinkedList" },
  { valor: "grafo", rotulo: "Grafo" },
];

export function BotoesPalpite({ onPalpite, desabilitado }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {OPCOES.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => onPalpite(o.valor)}
          disabled={desabilitado}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 transition hover:border-blue-400 hover:bg-blue-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/20 disabled:hover:bg-white/5"
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}
