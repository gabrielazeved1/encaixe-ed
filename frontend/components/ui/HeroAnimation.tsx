import type { CSSProperties } from "react";

const ANIM = "edSeq 5s ease-in-out infinite";

function seq(order: number, step = 0.45): CSSProperties {
  return { animation: ANIM, animationDelay: `${(order * step).toFixed(2)}s` };
}

type Accent = "green" | "purple" | "orange" | "cyan";

const ACCENT: Record<Accent, { border: string; label: string }> = {
  green:  { border: "border-green-900/40",  label: "text-green-500"  },
  purple: { border: "border-purple-900/40", label: "text-purple-500" },
  orange: { border: "border-orange-900/40", label: "text-orange-500" },
  cyan:   { border: "border-cyan-900/40",   label: "text-cyan-500"   },
};

function Panel({
  accent,
  title,
  sub,
  children,
}: {
  accent: Accent;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <div className={`rounded-lg border ${a.border} bg-[#0d1117]/70 p-3`}>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={`text-[10px] font-mono font-semibold tracking-widest uppercase ${a.label}`}>
          {title}
        </span>
        <span className="text-[9px] text-slate-600 font-mono">{sub}</span>
      </div>
      {children}
    </div>
  );
}

function BSTPanel() {
  const edges: [number, number, number, number][] = [
    [100, 20, 55, 62], [100, 20, 145, 62],
    [55, 62, 28, 104], [55, 62, 82, 104],
    [145, 62, 118, 104], [145, 62, 172, 104],
  ];
  const nodes = [
    { cx: 100, cy: 20,  v: "8",  o: 3 },
    { cx: 55,  cy: 62,  v: "4",  o: 1 },
    { cx: 145, cy: 62,  v: "12", o: 5 },
    { cx: 28,  cy: 104, v: "2",  o: 0 },
    { cx: 82,  cy: 104, v: "6",  o: 2 },
    { cx: 118, cy: 104, v: "10", o: 4 },
    { cx: 172, cy: 104, v: "14", o: 6 },
  ];

  return (
    <Panel accent="green" title="Árvore BST" sub="in-order">
      <svg viewBox="0 0 200 122" className="w-full">
        {edges.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgb(74 222 128)" strokeWidth="1.5" opacity="0.15" />
        ))}
        {nodes.map((n) => (
          <g key={n.v} style={seq(n.o)}>
            <circle cx={n.cx} cy={n.cy} r={13}
              fill="rgb(5 46 22)" stroke="rgb(74 222 128)" strokeWidth="1.5" />
            <text x={n.cx} y={n.cy + 4} textAnchor="middle"
              fill="rgb(187 247 208)" fontSize="10" fontFamily="monospace">
              {n.v}
            </text>
          </g>
        ))}
      </svg>
    </Panel>
  );
}

function GraphPanel() {
  const edges: [number, number, number, number][] = [
    [100, 20, 38, 70], [100, 20, 162, 70],
    [38, 70, 68, 115], [38, 70, 132, 115],
    [162, 70, 132, 115],
  ];
  const nodes = [
    { cx: 100, cy: 20,  v: "A", o: 0 },
    { cx: 38,  cy: 70,  v: "B", o: 1 },
    { cx: 162, cy: 70,  v: "C", o: 2 },
    { cx: 68,  cy: 115, v: "D", o: 3 },
    { cx: 132, cy: 115, v: "E", o: 4 },
  ];

  return (
    <Panel accent="purple" title="Grafo" sub="Dijkstra / BFS">
      <svg viewBox="0 0 200 132" className="w-full">
        {edges.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgb(192 132 252)" strokeWidth="1.5" opacity="0.15" />
        ))}
        {nodes.map((n) => (
          <g key={n.v} style={seq(n.o)}>
            <circle cx={n.cx} cy={n.cy} r={13}
              fill="rgb(59 7 100)" stroke="rgb(192 132 252)" strokeWidth="1.5" />
            <text x={n.cx} y={n.cy + 4} textAnchor="middle"
              fill="rgb(233 213 255)" fontSize="10" fontFamily="monospace">
              {n.v}
            </text>
          </g>
        ))}
      </svg>
    </Panel>
  );
}

function HashPanel() {
  const cells = ["A", "", "B", "C", "", "D", "", "E"];
  const W = 20, H = 28, GAP = 2;
  const total = cells.length * W + (cells.length - 1) * GAP;
  const x0 = (200 - total) / 2;
  const cy = 44;

  return (
    <Panel accent="orange" title="Hash Table" sub="acesso O(1)">
      <svg viewBox="0 0 200 72" className="w-full">
        {cells.map((v, i) => {
          const x = x0 + i * (W + GAP);
          const empty = v === "";
          return (
            <g key={i} style={empty ? undefined : seq(i, 0.3)}>
              <rect x={x} y={cy - H / 2} width={W} height={H} rx={2}
                fill={empty ? "rgb(15 23 42)" : "rgb(67 20 7)"}
                stroke={empty ? "rgb(51 65 85)" : "rgb(251 146 60)"}
                strokeWidth="1"
                opacity={empty ? 0.35 : undefined}
              />
              {!empty && (
                <text x={x + W / 2} y={cy + 4} textAnchor="middle"
                  fill="rgb(254 215 170)" fontSize="9" fontFamily="monospace">
                  {v}
                </text>
              )}
              <text x={x + W / 2} y={cy + H / 2 + 10} textAnchor="middle"
                fill="rgb(71 85 105)" fontSize="7" fontFamily="monospace">
                {i}
              </text>
            </g>
          );
        })}
      </svg>
    </Panel>
  );
}

function LinkedListPanel() {
  const NW = 42, NH = 28, GAP = 18;
  const labels = ["head", "·", "tail"];
  const total = labels.length * NW + (labels.length - 1) * GAP + 24;
  const x0 = (200 - total) / 2;
  const cy = 36;

  return (
    <Panel accent="cyan" title="Lista Ligada" sub="inserção O(1)">
      <svg viewBox="0 0 200 68" className="w-full">
        <defs>
          <marker id="arrowC" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L5,2.5 z" fill="rgb(34 211 238)" opacity="0.4" />
          </marker>
        </defs>
        {labels.map((v, i) => {
          const x = x0 + i * (NW + GAP);
          return (
            <g key={i} style={seq(i)}>
              <rect x={x} y={cy - NH / 2} width={NW} height={NH} rx={4}
                fill="rgb(8 51 68)" stroke="rgb(34 211 238)" strokeWidth="1.5" />
              <text x={x + NW / 2} y={cy + 4} textAnchor="middle"
                fill="rgb(207 250 254)" fontSize="9" fontFamily="monospace">
                {v}
              </text>
              {i < labels.length - 1 && (
                <line
                  x1={x + NW + 2} y1={cy}
                  x2={x + NW + GAP - 2} y2={cy}
                  stroke="rgb(34 211 238)" strokeWidth="1.5"
                  markerEnd="url(#arrowC)" opacity="0.4"
                />
              )}
            </g>
          );
        })}
        <text
          x={x0 + labels.length * (NW + GAP) + 4}
          y={cy + 4}
          fill="rgb(71 85 105)" fontSize="11" fontFamily="monospace"
        >
          ∅
        </text>
      </svg>
    </Panel>
  );
}

export function HeroAnimation() {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] overflow-hidden shadow-xl shadow-black/30 select-none">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-700/50 bg-[#0d1117]/70">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="ml-3 text-slate-500 text-xs font-mono">
          encaixe — estruturas de dados
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 p-3">
        <BSTPanel />
        <GraphPanel />
        <HashPanel />
        <LinkedListPanel />
      </div>
    </div>
  );
}
