"use client";

import { StepControls } from "@/components/ui/StepControls";
import { StepNarrator } from "@/components/ui/StepNarrator";
import { useStepPlayer } from "@/hooks/useStepPlayer";
import type { FramePilha, PassoPilha } from "@/types/passos";

type Props = {
  passos: PassoPilha[];
};

function argumentoDestacado(destaques: string[]): number | null {
  const d = destaques.find((x) => x.startsWith("frame:"));
  if (!d) return null;
  const n = Number.parseInt(d.slice("frame:".length), 10);
  return Number.isNaN(n) ? null : n;
}

export function PilhaVisual({ passos }: Props) {
  const player = useStepPlayer<FramePilha[]>(passos);
  const passo = player.passoAtual;
  const pilha = passo?.estado ?? [];
  const alvo = argumentoDestacado(passo?.destaques ?? []);
  const isOverflow = (passo?.descricao ?? "").includes("stack overflow");

  return (
    <div className="space-y-4">
      {isOverflow && (
        <div className="rounded-lg border border-red-500/60 bg-red-900/30 px-4 py-2.5 text-center font-mono text-sm text-red-300">
          ⚠ Stack Overflow — profundidade máxima atingida
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[1fr_minmax(14rem,22rem)]">
        <div className="flex min-h-48 flex-col-reverse gap-1 rounded-lg border border-slate-700 bg-[#0d1117] p-3">
          {pilha.map((frame, i) => {
            const isTop = i === pilha.length - 1;
            const isAlvo = alvo !== null && frame.argumento === alvo;
            return (
              <div
                key={`${frame.nome_funcao}-${frame.profundidade}-${i}`}
                data-destaque={isAlvo ? `frame:${frame.argumento}` : undefined}
                className={`rounded border px-3 py-2 font-mono text-sm transition-all duration-200 ${
                  isAlvo
                    ? "border-blue-400 bg-blue-900/60 text-blue-100 ring-2 ring-blue-500/50"
                    : isTop
                      ? "border-blue-500 bg-blue-900/50 text-blue-200"
                      : "border-slate-600 bg-slate-800 text-slate-300"
                }`}
              >
                <span className="mr-2 text-xs text-slate-500">
                  [{frame.profundidade}]
                </span>
                {frame.nome_funcao}({frame.argumento})
                {frame.retorno !== null && (
                  <span className="ml-2 text-green-400">→ {frame.retorno}</span>
                )}
                {isTop && (
                  <span className="ml-2 text-xs text-blue-400/60">← topo</span>
                )}
              </div>
            );
          })}

          {pilha.length === 0 && !isOverflow && (
            <div className="flex h-full min-h-36 items-center justify-center text-sm text-slate-600">
              pilha vazia
            </div>
          )}
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
    </div>
  );
}
