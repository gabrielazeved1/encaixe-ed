"use client";

import { NoBST, PassoBST } from "@/lib/api";

type Props = {
  arvore: NoBST | null;
  passos: PassoBST[];
  encontrado: boolean;
  comparacoesBst: number;
  comparacoesLinear: number;
};

const CMP_LABEL: Record<PassoBST["comparacao"], string> = {
  igual: "igual (encontrado)",
  menor: "alvo < nó · desce à esquerda",
  maior: "alvo > nó · desce à direita",
};

const CMP_COR: Record<PassoBST["comparacao"], string> = {
  igual: "text-green-400 border-green-500/40",
  menor: "text-blue-400 border-blue-500/40",
  maior: "text-orange-400 border-orange-500/40",
};

export function IndiceBSTVisual({
  passos,
  encontrado,
  comparacoesBst,
  comparacoesLinear,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-[#0d1117] border border-teal-500/40 p-4 text-center">
          <div className="text-xs font-semibold tracking-wider uppercase text-teal-400">
            BST
          </div>
          <div className="mt-1 text-3xl font-mono font-bold text-teal-300">
            {comparacoesBst}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">comparações</div>
        </div>
        <div className="rounded-lg bg-[#0d1117] border border-slate-600 p-4 text-center">
          <div className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Linear
          </div>
          <div className="mt-1 text-3xl font-mono font-bold text-slate-300">
            {comparacoesLinear}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">comparações</div>
        </div>
      </div>

      <div className="rounded-lg bg-[#0d1117] border border-slate-700 p-4 space-y-3">
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          Caminho da busca
        </p>
        {passos.length === 0 ? (
          <p className="text-sm text-slate-500 font-mono">sem passos</p>
        ) : (
          <ol className="space-y-2">
            {passos.map((p, i) => (
              <li
                key={i}
                className={`flex items-center gap-3 rounded border ${CMP_COR[p.comparacao]} bg-slate-900/40 px-3 py-2 font-mono text-sm`}
              >
                <span className="text-slate-600 text-xs w-5">{i + 1}</span>
                <span className="text-slate-200">nó {p.no}</span>
                <span className="text-slate-500">→</span>
                <span>{CMP_LABEL[p.comparacao]}</span>
              </li>
            ))}
          </ol>
        )}
        <p
          className={`text-sm font-mono ${encontrado ? "text-green-400" : "text-red-400"}`}
        >
          {encontrado ? "✓ valor encontrado" : "✗ valor não encontrado"}
        </p>
      </div>
    </div>
  );
}
