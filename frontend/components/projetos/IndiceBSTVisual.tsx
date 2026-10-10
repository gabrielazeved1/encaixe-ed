"use client";

import { StepControls } from "@/components/ui/StepControls";
import { StepNarrator } from "@/components/ui/StepNarrator";
import { useStepPlayer } from "@/hooks/useStepPlayer";
import type { EstadoBst, NoBst, PassoBst } from "@/types/passos";

type Props = {
  passos: PassoBst[];
};

type NoPosicionado = {
  valor: number;
  x: number;
  y: number;
  pai?: { x: number; y: number };
};

function destaquesDeValores(destaques: string[]): Set<number> {
  const alvos = new Set<number>();
  for (const d of destaques) {
    if (d.startsWith("no:")) {
      const n = Number.parseInt(d.slice("no:".length), 10);
      if (!Number.isNaN(n)) alvos.add(n);
    }
  }
  return alvos;
}

function posicionarNos(
  no: NoBst,
  x: number,
  y: number,
  passoX: number,
  pai: { x: number; y: number } | undefined,
  acc: NoPosicionado[]
): void {
  if (no === null) return;
  acc.push({ valor: no.valor, x, y, pai });
  const prox = passoX / 2;
  posicionarNos(no.esq, x - passoX, y + 42, prox, { x, y }, acc);
  posicionarNos(no.dir, x + passoX, y + 42, prox, { x, y }, acc);
}

function profundidade(no: NoBst): number {
  if (no === null) return 0;
  return 1 + Math.max(profundidade(no.esq), profundidade(no.dir));
}

function TreeView({
  arvore,
  destacados,
}: {
  arvore: EstadoBst;
  destacados: Set<number>;
}) {
  if (arvore === null) {
    return (
      <div className="flex h-full min-h-48 items-center justify-center font-mono text-sm text-slate-600">
        árvore vazia
      </div>
    );
  }
  const d = profundidade(arvore);
  const largura = Math.max(200, 2 ** d * 32);
  const altura = d * 44 + 20;
  const passoInicial = largura / 4;
  const nos: NoPosicionado[] = [];
  posicionarNos(arvore, largura / 2, 20, passoInicial, undefined, nos);

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      className="w-full"
      role="img"
      aria-label="árvore binária de busca"
    >
      {nos.map(
        (n) =>
          n.pai && (
            <line
              key={`e-${n.valor}`}
              x1={n.pai.x}
              y1={n.pai.y}
              x2={n.x}
              y2={n.y}
              stroke="rgb(45 212 191)"
              strokeWidth="1.5"
              opacity="0.35"
            />
          )
      )}
      {nos.map((n) => {
        const alvo = destacados.has(n.valor);
        return (
          <g key={n.valor} data-destaque={alvo ? `no:${n.valor}` : undefined}>
            <circle
              cx={n.x}
              cy={n.y}
              r={14}
              fill={alvo ? "rgb(30 64 175)" : "rgb(19 78 74)"}
              stroke={alvo ? "rgb(96 165 250)" : "rgb(45 212 191)"}
              strokeWidth={alvo ? "2.5" : "1.5"}
              className="transition-colors duration-200"
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              fill={alvo ? "rgb(219 234 254)" : "rgb(204 251 241)"}
              fontSize="11"
              fontFamily="monospace"
            >
              {n.valor}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function IndiceBSTVisual({ passos }: Props) {
  const player = useStepPlayer<EstadoBst>(passos);
  const passo = player.passoAtual;
  const arvore: EstadoBst = passo?.estado ?? null;
  const destacados = destaquesDeValores(passo?.destaques ?? []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_minmax(14rem,22rem)]">
        <div className="min-h-56 rounded-lg border border-slate-700 bg-[#0d1117] p-4">
          <TreeView arvore={arvore} destacados={destacados} />
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
        />
      </div>
    </div>
  );
}
