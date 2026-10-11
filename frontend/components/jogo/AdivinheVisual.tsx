"use client";

import type { Estrutura, PassoJogo } from "@/lib/api";

type Props = {
  estrutura: Estrutura;
  passo: PassoJogo;
};

type NoBST = {
  valor: number;
  esq: NoBST | null;
  dir: NoBST | null;
} | null;

export function AdivinheVisual({ estrutura, passo }: Props) {
  const { estado, destaques } = passo;

  return (
    <div className="rounded-lg border border-slate-700 bg-[#0d1117] p-3">
      {estrutura === "pilha" && (
        <PilhaVisual e={estado as { elementos: number[] }} d={destaques} />
      )}
      {estrutura === "fila" && (
        <FilaVisual e={estado as { elementos: number[] }} d={destaques} />
      )}
      {estrutura === "heap" && (
        <HeapVisual e={estado as { arranjo: number[] }} d={destaques} />
      )}
      {estrutura === "hash" && (
        <HashVisual
          e={estado as { tamanho: number; buckets: [string, unknown][][] }}
          d={destaques}
        />
      )}
      {estrutura === "bst" && <BSTVisual e={estado as NoBST} d={destaques} />}
      {estrutura === "linkedlist" && (
        <LinkedListVisual e={estado as { elementos: number[] }} d={destaques} />
      )}
      {estrutura === "grafo" && (
        <GrafoVisual e={estado as Record<string, unknown>} d={destaques} />
      )}
    </div>
  );
}

function PilhaVisual({
  e,
  d,
}: {
  e: { elementos: number[] };
  d: string[];
}) {
  const els = e.elementos ?? [];
  const isTop = d.includes("topo");
  const rowH = 34;
  const W = 160;
  const H = Math.max(100, els.length * rowH + 24);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-56">
      <line x1={28} y1={H - 6} x2={132} y2={H - 6} stroke="#475569" strokeWidth={2} />
      {els.map((v, i) => {
        const y = H - (i + 1) * rowH - 6;
        const hl = isTop && i === els.length - 1;
        return (
          <g key={i}>
            <rect
              x={28} y={y} width={104} height={rowH - 4} rx={4}
              fill={hl ? "#1e3a8a" : "#1e293b"}
              stroke={hl ? "#60a5fa" : "#334155"}
              strokeWidth={1.5}
            />
            <text
              x={80} y={y + rowH / 2 + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill={hl ? "#93c5fd" : "#94a3b8"}
              fontSize={13} fontFamily="monospace"
            >
              {v}
            </text>
            {hl && (
              <text x={138} y={y + rowH / 2 + 1} dominantBaseline="middle"
                fill="#60a5fa" fontSize={9} fontFamily="monospace">
                ← topo
              </text>
            )}
          </g>
        );
      })}
      {els.length === 0 && (
        <text x={80} y={H / 2} textAnchor="middle" fill="#475569" fontSize={11} fontFamily="monospace">
          vazio
        </text>
      )}
    </svg>
  );
}

function FilaVisual({ e, d }: { e: { elementos: number[] }; d: string[] }) {
  const els = e.elementos ?? [];
  const boxW = 48;
  const boxH = 36;
  const gap = 8;
  const W = Math.max(180, els.length * (boxW + gap) + 40);
  const H = 72;
  const hlInicio = d.includes("inicio");
  const hlFim = d.includes("fim");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-28">
      {els.map((v, i) => {
        const x = 16 + i * (boxW + gap);
        const hl = (hlInicio && i === 0) || (hlFim && i === els.length - 1);
        return (
          <g key={i}>
            <rect
              x={x} y={18} width={boxW} height={boxH} rx={4}
              fill={hl ? "#1e3a8a" : "#1e293b"}
              stroke={hl ? "#60a5fa" : "#334155"}
              strokeWidth={1.5}
            />
            <text
              x={x + boxW / 2} y={36} textAnchor="middle" dominantBaseline="middle"
              fill={hl ? "#93c5fd" : "#94a3b8"}
              fontSize={13} fontFamily="monospace"
            >
              {v}
            </text>
            {i < els.length - 1 && (
              <text
                x={x + boxW + gap / 2} y={37}
                textAnchor="middle" dominantBaseline="middle"
                fill="#475569" fontSize={14}
              >
                →
              </text>
            )}
          </g>
        );
      })}
      {els.length > 0 && (
        <>
          <text x={16} y={13} fill="#64748b" fontSize={8} fontFamily="monospace">frente</text>
          <text x={16 + (els.length - 1) * (boxW + gap)} y={13} fill="#64748b" fontSize={8} fontFamily="monospace">fim</text>
        </>
      )}
      {els.length === 0 && (
        <text x={W / 2} y={36} textAnchor="middle" fill="#475569" fontSize={11} fontFamily="monospace">
          vazio
        </text>
      )}
    </svg>
  );
}

function HeapVisual({ e, d }: { e: { arranjo: number[] }; d: string[] }) {
  const arr = e.arranjo ?? [];
  const highlighted = new Set(
    d
      .filter((s) => s.startsWith("indice:"))
      .map((s) => parseInt(s.split(":")[1], 10))
  );

  const nodeR = 16;
  const levelH = 52;

  type Node = { idx: number; cx: number; cy: number; parent?: { cx: number; cy: number } };

  function buildNodes(
    i: number,
    level: number,
    xMin: number,
    xMax: number,
    parent?: { cx: number; cy: number }
  ): Node[] {
    if (i >= arr.length) return [];
    const cx = (xMin + xMax) / 2;
    const cy = level * levelH + nodeR + 4;
    const result: Node[] = [{ idx: i, cx, cy, parent }];
    result.push(...buildNodes(2 * i + 1, level + 1, xMin, cx, { cx, cy }));
    result.push(...buildNodes(2 * i + 2, level + 1, cx, xMax, { cx, cy }));
    return result;
  }

  const depth = arr.length === 0 ? 0 : Math.floor(Math.log2(arr.length));
  const W = Math.max(180, 2 ** depth * 40);
  const H = (depth + 1) * levelH + nodeR + 8;
  const nodes = buildNodes(0, 0, 0, W);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-64">
      {nodes.map((n) =>
        n.parent ? (
          <line
            key={`e${n.idx}`}
            x1={n.parent.cx} y1={n.parent.cy}
            x2={n.cx} y2={n.cy}
            stroke="#334155" strokeWidth={1.5}
          />
        ) : null
      )}
      {nodes.map((n) => {
        const hl = highlighted.has(n.idx);
        return (
          <g key={n.idx}>
            <circle
              cx={n.cx} cy={n.cy} r={nodeR}
              fill={hl ? "#1e3a8a" : "#1e293b"}
              stroke={hl ? "#60a5fa" : "#334155"}
              strokeWidth={1.5}
            />
            <text
              x={n.cx} y={n.cy} textAnchor="middle" dominantBaseline="middle"
              fill={hl ? "#93c5fd" : "#94a3b8"}
              fontSize={11} fontFamily="monospace"
            >
              {arr[n.idx]}
            </text>
            <text
              x={n.cx} y={n.cy + nodeR + 10}
              textAnchor="middle" fill="#475569" fontSize={8} fontFamily="monospace"
            >
              {n.idx}
            </text>
          </g>
        );
      })}
      {arr.length === 0 && (
        <text x={W / 2} y={H / 2} textAnchor="middle" fill="#475569" fontSize={11} fontFamily="monospace">
          vazio
        </text>
      )}
    </svg>
  );
}

function HashVisual({
  e,
  d,
}: {
  e: { tamanho: number; buckets: [string, unknown][][] };
  d: string[];
}) {
  const { tamanho = 8, buckets = [] } = e;
  const hlBuckets = new Set(
    d
      .filter((s) => s.startsWith("bucket:"))
      .map((s) => parseInt(s.split(":")[1], 10))
  );

  const rowH = 22;
  const W = 220;
  const H = tamanho * rowH + 16;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-52">
      {Array.from({ length: tamanho }, (_, i) => {
        const y = i * rowH + 8;
        const hl = hlBuckets.has(i);
        const chain = buckets[i] ?? [];
        return (
          <g key={i}>
            <rect
              x={4} y={y} width={28} height={rowH - 2} rx={2}
              fill={hl ? "#312e81" : "#1e293b"}
              stroke={hl ? "#818cf8" : "#334155"}
              strokeWidth={1}
            />
            <text
              x={18} y={y + rowH / 2 - 1} textAnchor="middle" dominantBaseline="middle"
              fill={hl ? "#a5b4fc" : "#64748b"}
              fontSize={9} fontFamily="monospace"
            >
              {i}
            </text>
            {chain.map(([k], j) => (
              <g key={j}>
                <rect
                  x={36 + j * 52} y={y + 2}
                  width={46} height={rowH - 6} rx={2}
                  fill={hl ? "#1e3a8a" : "#1e293b"}
                  stroke={hl ? "#60a5fa" : "#334155"}
                  strokeWidth={1}
                />
                <text
                  x={36 + j * 52 + 23} y={y + rowH / 2 - 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={hl ? "#93c5fd" : "#94a3b8"}
                  fontSize={8} fontFamily="monospace"
                >
                  {String(k).slice(0, 4)}
                </text>
                {j < chain.length - 1 && (
                  <text
                    x={36 + j * 52 + 47} y={y + rowH / 2 - 1}
                    dominantBaseline="middle"
                    fill="#475569" fontSize={10}
                  >
                    →
                  </text>
                )}
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

type LayoutNode = {
  cx: number;
  cy: number;
  valor: number;
  parent?: { cx: number; cy: number };
};

function bstLayout(
  node: NoBST,
  level: number,
  xMin: number,
  xMax: number,
  parent?: { cx: number; cy: number }
): LayoutNode[] {
  if (!node) return [];
  const cx = (xMin + xMax) / 2;
  const cy = level * 52 + 20;
  return [
    { cx, cy, valor: node.valor, parent },
    ...bstLayout(node.esq, level + 1, xMin, cx, { cx, cy }),
    ...bstLayout(node.dir, level + 1, cx, xMax, { cx, cy }),
  ];
}

function bstDepth(node: NoBST): number {
  if (!node) return 0;
  return 1 + Math.max(bstDepth(node.esq), bstDepth(node.dir));
}

function BSTVisual({ e, d }: { e: NoBST; d: string[] }) {
  const hlValues = new Set(
    d.filter((s) => s.startsWith("no:")).map((s) => parseInt(s.split(":")[1], 10))
  );
  const depth = bstDepth(e);
  const W = Math.max(200, 2 ** (depth - 1) * 44);
  const H = Math.max(100, depth * 52 + 16);
  const nodes = bstLayout(e, 0, 0, W);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-64">
      {nodes.map((n, i) =>
        n.parent ? (
          <line
            key={`e${i}`}
            x1={n.parent.cx} y1={n.parent.cy}
            x2={n.cx} y2={n.cy}
            stroke="#334155" strokeWidth={1.5}
          />
        ) : null
      )}
      {nodes.map((n, i) => {
        const hl = hlValues.has(n.valor);
        return (
          <g key={i}>
            <circle
              cx={n.cx} cy={n.cy} r={16}
              fill={hl ? "#1e3a8a" : "#1e293b"}
              stroke={hl ? "#60a5fa" : "#334155"}
              strokeWidth={1.5}
            />
            <text
              x={n.cx} y={n.cy} textAnchor="middle" dominantBaseline="middle"
              fill={hl ? "#93c5fd" : "#94a3b8"}
              fontSize={11} fontFamily="monospace"
            >
              {n.valor}
            </text>
          </g>
        );
      })}
      {!e && (
        <text x={W / 2} y={H / 2} textAnchor="middle" fill="#475569" fontSize={11} fontFamily="monospace">
          vazio
        </text>
      )}
    </svg>
  );
}

function LinkedListVisual({
  e,
  d,
}: {
  e: { elementos: number[] };
  d: string[];
}) {
  const els = e.elementos ?? [];
  const hlPos = new Set(
    d.filter((s) => s.startsWith("pos:")).map((s) => parseInt(s.split(":")[1], 10))
  );
  const boxW = 40;
  const boxH = 32;
  const gap = 24;
  const W = Math.max(180, els.length * (boxW + gap) + 60);
  const H = 60;
  const cy = 30;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-24">
      {els.map((v, i) => {
        const x = 8 + i * (boxW + gap);
        const hl = hlPos.has(i);
        return (
          <g key={i}>
            <rect
              x={x} y={cy - boxH / 2} width={boxW} height={boxH} rx={4}
              fill={hl ? "#1e3a8a" : "#1e293b"}
              stroke={hl ? "#60a5fa" : "#334155"}
              strokeWidth={1.5}
            />
            <text
              x={x + boxW / 2} y={cy} textAnchor="middle" dominantBaseline="middle"
              fill={hl ? "#93c5fd" : "#94a3b8"}
              fontSize={12} fontFamily="monospace"
            >
              {v}
            </text>
            {i < els.length - 1 ? (
              <text
                x={x + boxW + gap / 2} y={cy}
                textAnchor="middle" dominantBaseline="middle"
                fill="#475569" fontSize={14}
              >
                →
              </text>
            ) : (
              <text
                x={x + boxW + 4} y={cy}
                dominantBaseline="middle"
                fill="#475569" fontSize={9} fontFamily="monospace"
              >
                null
              </text>
            )}
          </g>
        );
      })}
      {els.length === 0 && (
        <text x={W / 2} y={cy} textAnchor="middle" fill="#475569" fontSize={11} fontFamily="monospace">
          vazio
        </text>
      )}
    </svg>
  );
}

const GRAFO_NODES: Record<string, { cx: number; cy: number }> = {
  A: { cx: 120, cy: 28 },
  B: { cx: 48, cy: 110 },
  C: { cx: 192, cy: 110 },
  D: { cx: 120, cy: 188 },
};

const GRAFO_ARESTAS: { de: string; para: string; peso: number }[] = [
  { de: "A", para: "B", peso: 1 },
  { de: "A", para: "C", peso: 4 },
  { de: "B", para: "C", peso: 2 },
  { de: "B", para: "D", peso: 5 },
  { de: "C", para: "D", peso: 1 },
];

function GrafoVisual({
  e,
  d,
}: {
  e: Record<string, unknown>;
  d: string[];
}) {
  const hlNos = new Set(
    d.filter((s) => s.startsWith("no:")).map((s) => s.split(":")[1])
  );
  const hlArestas = new Set(
    d.filter((s) => s.startsWith("aresta:")).map((s) => s.split(":")[1])
  );

  const visitados = Array.isArray(e.visitados)
    ? new Set(e.visitados as string[])
    : new Set<string>();
  const distancias = (e.distancias ?? {}) as Record<string, number | null>;
  const visitadoAtual = typeof e.visitado === "string" ? e.visitado : null;

  const W = 240;
  const H = 220;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-56">
      {GRAFO_ARESTAS.map(({ de, para, peso }) => {
        const a = GRAFO_NODES[de];
        const b = GRAFO_NODES[para];
        const key1 = `${de}-${para}`;
        const key2 = `${para}-${de}`;
        const hl = hlArestas.has(key1) || hlArestas.has(key2);
        const mx = (a.cx + b.cx) / 2;
        const my = (a.cy + b.cy) / 2;
        return (
          <g key={key1}>
            <line
              x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
              stroke={hl ? "#60a5fa" : "#334155"}
              strokeWidth={hl ? 2.5 : 1.5}
            />
            <text
              x={mx} y={my - 6}
              textAnchor="middle" fill={hl ? "#93c5fd" : "#64748b"}
              fontSize={9} fontFamily="monospace"
            >
              {peso}
            </text>
          </g>
        );
      })}
      {Object.entries(GRAFO_NODES).map(([nome, { cx, cy }]) => {
        const hl = hlNos.has(nome) || visitadoAtual === nome;
        const visited = visitados.has(nome);
        const dist = distancias[nome];
        return (
          <g key={nome}>
            <circle
              cx={cx} cy={cy} r={20}
              fill={hl ? "#1e3a8a" : visited ? "#1a2e44" : "#1e293b"}
              stroke={hl ? "#60a5fa" : visited ? "#3b82f6" : "#334155"}
              strokeWidth={hl ? 2.5 : 1.5}
            />
            <text
              x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle"
              fill={hl ? "#93c5fd" : visited ? "#7dd3fc" : "#94a3b8"}
              fontSize={13} fontWeight="bold" fontFamily="monospace"
            >
              {nome}
            </text>
            {dist !== undefined && dist !== null && (
              <text
                x={cx} y={cy + 11} textAnchor="middle"
                fill={hl ? "#bfdbfe" : "#64748b"} fontSize={8} fontFamily="monospace"
              >
                {dist}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
