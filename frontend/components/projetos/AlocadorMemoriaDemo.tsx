"use client";

import { useState } from "react";
import { useAlocadorMemoria } from "@/hooks/useAlocadorMemoria";
import { AlocadorMemoriaVisual } from "@/components/projetos/AlocadorMemoriaVisual";
import { Operacao, EstadoMemoria } from "@/lib/api";

const ESTADO_INICIAL: EstadoMemoria = {
  blocos: [{ id: 0, tamanho: 512, livre: true }],
  livre_total: 512,
  usado_total: 0,
  fragmentacao: 0,
};

export function AlocadorMemoriaDemo() {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [blocoIdInput, setBlocoIdInput] = useState<string>("");
  const [passoAtual, setPassoAtual] = useState(0);
  const { resultado, loading, erro, simular } = useAlocadorMemoria();

  async function enviar(novasOps: Operacao[]) {
    setOperacoes(novasOps);
    setPassoAtual(novasOps.length - 1);
    if (novasOps.length > 0) {
      await simular(novasOps);
    }
  }

  function alocar(tamanho: number) {
    enviar([...operacoes, { tipo: "alocar", tamanho }]);
  }

  function liberar() {
    const id = parseInt(blocoIdInput, 10);
    if (isNaN(id)) return;
    setBlocoIdInput("");
    enviar([...operacoes, { tipo: "liberar", bloco_id: id }]);
  }

  function resetar() {
    setOperacoes([]);
    setPassoAtual(0);
  }

  const estadoAtual: EstadoMemoria =
    resultado && operacoes.length > 0 && resultado.estados[passoAtual]
      ? resultado.estados[passoAtual]
      : ESTADO_INICIAL;

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6">
      <h2 className="text-base font-semibold text-white mb-5">
        Demonstração interativa
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => alocar(64)}
            disabled={loading}
            className="text-sm px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-colors"
          >
            alocar 64B
          </button>
          <button
            onClick={() => alocar(128)}
            disabled={loading}
            className="text-sm px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-colors"
          >
            alocar 128B
          </button>
          <button
            onClick={() => alocar(32)}
            disabled={loading}
            className="text-sm px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-colors"
          >
            alocar 32B
          </button>
          <button
            onClick={resetar}
            className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ml-auto"
          >
            resetar
          </button>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-mono text-slate-500">
            liberar bloco{" "}
            <span className="text-slate-600">— use o #id exibido na barra</span>
          </span>
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="number"
              min={0}
              value={blocoIdInput}
              onChange={(e) => setBlocoIdInput(e.target.value)}
              className="w-32 bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
              placeholder="ex: 0"
            />
            <button
              onClick={liberar}
              disabled={loading || blocoIdInput === ""}
              className="text-sm px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white transition-colors"
            >
              liberar
            </button>
          </div>
        </div>
      </div>

      {erro && <p className="text-red-400 text-sm mb-4">{erro}</p>}

      <AlocadorMemoriaVisual estado={estadoAtual} />

      {resultado && operacoes.length > 0 && (
        <div className="flex gap-2 justify-center pt-4">
          <button
            onClick={() => setPassoAtual((n) => Math.max(0, n - 1))}
            disabled={passoAtual === 0}
            className="px-4 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 transition-colors"
          >
            ← anterior
          </button>
          <span className="text-slate-500 text-xs font-mono self-center px-2">
            passo {passoAtual + 1} de {resultado.estados.length}
          </span>
          <button
            onClick={() =>
              setPassoAtual((n) =>
                Math.min(resultado.estados.length - 1, n + 1)
              )
            }
            disabled={passoAtual === resultado.estados.length - 1}
            className="px-4 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 transition-colors"
          >
            próximo →
          </button>
        </div>
      )}
    </div>
  );
}
