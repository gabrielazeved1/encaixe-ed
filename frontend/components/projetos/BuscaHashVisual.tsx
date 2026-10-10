"use client";

import { StepControls } from "@/components/ui/StepControls";
import { StepNarrator } from "@/components/ui/StepNarrator";
import { useStepPlayer } from "@/hooks/useStepPlayer";
import { BuscaHashResult } from "@/lib/api";
import type { EstadoHash, PassoHash } from "@/types/passos";

type Props = {
  passos: PassoHash[];
  resumo: BuscaHashResult;
  chave: string;
};

function bucketsDestacados(destaques: string[]): Set<number> {
  const alvos = new Set<number>();
  for (const d of destaques) {
    if (d.startsWith("bucket:")) {
      const n = Number.parseInt(d.slice("bucket:".length), 10);
      if (!Number.isNaN(n)) alvos.add(n);
    }
  }
  return alvos;
}

function GridBuckets({
  estado,
  destacados,
}: {
  estado: EstadoHash;
  destacados: Set<number>;
}) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {estado.buckets.map((bucket, idx) => {
        const vazio = bucket.length === 0;
        const alvo = destacados.has(idx);
        const base = alvo
          ? "border-blue-400 bg-blue-900/60 ring-2 ring-blue-500/40"
          : vazio
            ? "border-slate-800 bg-slate-950/50"
            : "border-orange-500/40 bg-orange-900/20";
        return (
          <div
            key={idx}
            data-destaque={alvo ? `bucket:${idx}` : undefined}
            className={`flex min-h-16 flex-col items-center rounded border p-1 font-mono text-[9px] transition-all duration-200 ${base}`}
          >
            <span className="text-[8px] text-slate-500">[{idx}]</span>
            {bucket.length === 0 ? (
              <span className="mt-1 text-slate-700">—</span>
            ) : (
              <div className="mt-1 flex w-full flex-col gap-0.5">
                {bucket.map(([k], i) => (
                  <span
                    key={`${k}-${i}`}
                    className={`truncate rounded px-1 ${
                      alvo
                        ? "bg-blue-800/60 text-blue-100"
                        : "bg-orange-950/60 text-orange-200"
                    }`}
                    title={k}
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ResumoComparacao({
  resumo,
  chave,
}: {
  resumo: BuscaHashResult;
  chave: string;
}) {
  const { linear, hash } = resumo;
  const max = Math.max(linear.comparacoes, hash.comparacoes, 1);
  const ratio =
    hash.comparacoes > 0
      ? (linear.comparacoes / hash.comparacoes).toFixed(1)
      : "∞";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-700 bg-[#0d1117] p-4 text-sm">
        <p className="text-slate-400">
          Resultado da busca por{" "}
          <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-white">
            {chave}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-orange-500/40 bg-[#0d1117] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Busca Linear
            </span>
            <span className="font-mono text-xs text-slate-500">O(n)</span>
          </div>
          <div className="font-mono">
            <span className="text-4xl font-bold text-orange-300">
              {linear.comparacoes}
            </span>
            <span className="ml-2 text-sm text-slate-500">comparações</span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-slate-800">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${(linear.comparacoes / max) * 100}%` }}
            />
          </div>
          <p className="font-mono text-xs text-slate-500">
            {linear.encontrado ? "encontrado" : "não encontrado"}
          </p>
        </div>

        <div className="space-y-3 rounded-lg border border-blue-500/40 bg-[#0d1117] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Hash Table
            </span>
            <span className="font-mono text-xs text-slate-500">O(1)</span>
          </div>
          <div className="font-mono">
            <span className="text-4xl font-bold text-blue-300">
              {hash.comparacoes}
            </span>
            <span className="ml-2 text-sm text-slate-500">comparações</span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-slate-800">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(hash.comparacoes / max) * 100}%` }}
            />
          </div>
          <p className="font-mono text-xs text-slate-500">
            índice: {hash.indice}
            {" · "}
            {hash.encontrado ? "encontrado" : "não encontrado"}
          </p>
        </div>
      </div>

      {hash.comparacoes < linear.comparacoes && (
        <div className="rounded-lg border border-green-500/40 bg-green-900/20 px-4 py-2.5 text-center font-mono text-sm text-green-300">
          hash {ratio}× mais rápido que linear
        </div>
      )}
    </div>
  );
}

export function BuscaHashVisual({ passos, resumo, chave }: Props) {
  const player = useStepPlayer<EstadoHash>(passos);
  const passo = player.passoAtual;
  const estado: EstadoHash = passo?.estado ?? {
    tamanho: 16,
    buckets: Array.from({ length: 16 }, () => []),
  };
  const destacados = bucketsDestacados(passo?.destaques ?? []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_minmax(14rem,22rem)]">
        <div className="rounded-lg border border-slate-700 bg-[#0d1117] p-3">
          <GridBuckets estado={estado} destacados={destacados} />
        </div>

        <StepNarrator
          descricao={passo?.descricao ?? null}
          destaques={passo?.destaques ?? []}
          indice={passo ? player.indice : null}
          totalPassos={player.totalPassos}
        />
      </div>

      <div className="flex justify-center">
        <StepControls
          indice={player.indice}
          totalPassos={player.totalPassos}
          podeAvancar={player.podeAvancar}
          podeVoltar={player.podeVoltar}
          onAvancar={player.avancar}
          onVoltar={player.voltar}
          onResetar={player.resetar}
          tocando={player.tocando}
          velocidade={player.velocidade}
          onTocar={player.tocar}
          onPausar={player.pausar}
          onMudarVelocidade={player.setVelocidade}
        />
      </div>

      <ResumoComparacao resumo={resumo} chave={chave} />
    </div>
  );
}
