"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ROWS = 20;
const COLS = 42;
const START_INIT: [number, number] = [10, 5];
const END_INIT: [number, number] = [10, 36];

type CellStatus =
  | "empty"
  | "wall"
  | "start"
  | "end"
  | "visited"
  | "frontier"
  | "path";

type Grid = CellStatus[][];
type Algo = "bfs" | "dfs" | "astar";
type DrawMode = "idle" | "draw-wall" | "erase-wall" | "move-start" | "move-end";

type Step =
  | { type: "visit"; row: number; col: number }
  | { type: "frontier"; row: number; col: number }
  | { type: "path"; cells: [number, number][] }
  | { type: "no_path" };

const DIRS: [number, number][] = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];

const COLORS: Record<CellStatus, string> = {
  empty:    "#1e293b",
  wall:     "#94a3b8",
  start:    "#22c55e",
  end:      "#ef4444",
  visited:  "#1d4ed8",
  frontier: "#22d3ee",
  path:     "#facc15",
};

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

function makeGrid(
  sr: number, sc: number, er: number, ec: number
): Grid {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c): CellStatus => {
      if (r === sr && c === sc) return "start";
      if (r === er && c === ec) return "end";
      return "empty";
    })
  );
}

function clearViz(g: Grid): Grid {
  return g.map((row) =>
    row.map((cell): CellStatus =>
      cell === "visited" || cell === "frontier" || cell === "path"
        ? "empty"
        : cell
    )
  );
}

function reconstructPath(
  prev: Map<string, [number, number] | null>,
  end: [number, number]
): [number, number][] {
  const path: [number, number][] = [];
  let cur: [number, number] | null = end;
  while (cur !== null) {
    path.unshift(cur);
    const p = prev.get(`${cur[0]},${cur[1]}`);
    if (p === undefined) break;
    cur = p;
  }
  return path;
}

function bfsSteps(
  grid: Grid,
  start: [number, number],
  end: [number, number]
): Step[] {
  const steps: Step[] = [];
  const prev = new Map<string, [number, number] | null>();
  const queue: [number, number][] = [[start[0], start[1]]];
  prev.set(`${start[0]},${start[1]}`, null);

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    if (r === end[0] && c === end[1]) {
      steps.push({ type: "path", cells: reconstructPath(prev, end) });
      return steps;
    }
    if (grid[r][c] !== "start") steps.push({ type: "visit", row: r, col: c });
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (inBounds(nr, nc) && !prev.has(key) && grid[nr][nc] !== "wall") {
        prev.set(key, [r, c]);
        if (grid[nr][nc] !== "end") steps.push({ type: "frontier", row: nr, col: nc });
        queue.push([nr, nc]);
      }
    }
  }
  steps.push({ type: "no_path" });
  return steps;
}

function dfsSteps(
  grid: Grid,
  start: [number, number],
  end: [number, number]
): Step[] {
  const steps: Step[] = [];
  const prev = new Map<string, [number, number] | null>();
  const visited = new Set<string>();
  const stack: [number, number][] = [[start[0], start[1]]];
  prev.set(`${start[0]},${start[1]}`, null);

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (r === end[0] && c === end[1]) {
      steps.push({ type: "path", cells: reconstructPath(prev, end) });
      return steps;
    }
    if (grid[r][c] !== "start") steps.push({ type: "visit", row: r, col: c });
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      const nkey = `${nr},${nc}`;
      if (inBounds(nr, nc) && !visited.has(nkey) && grid[nr][nc] !== "wall") {
        if (!prev.has(nkey)) prev.set(nkey, [r, c]);
        if (grid[nr][nc] !== "end") steps.push({ type: "frontier", row: nr, col: nc });
        stack.push([nr, nc]);
      }
    }
  }
  steps.push({ type: "no_path" });
  return steps;
}

function astarSteps(
  grid: Grid,
  start: [number, number],
  end: [number, number]
): Step[] {
  const steps: Step[] = [];
  const [er, ec] = end;
  const h = (r: number, c: number) => Math.abs(r - er) + Math.abs(c - ec);

  type ANode = { row: number; col: number; g: number; f: number };
  const open: ANode[] = [{ row: start[0], col: start[1], g: 0, f: h(start[0], start[1]) }];
  const prev = new Map<string, [number, number] | null>();
  const g = new Map<string, number>();
  const closed = new Set<string>();

  prev.set(`${start[0]},${start[1]}`, null);
  g.set(`${start[0]},${start[1]}`, 0);

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift()!;
    const { row: r, col: c } = cur;
    const key = `${r},${c}`;
    if (closed.has(key)) continue;
    closed.add(key);

    if (r === er && c === ec) {
      steps.push({ type: "path", cells: reconstructPath(prev, end) });
      return steps;
    }
    if (grid[r][c] !== "start") steps.push({ type: "visit", row: r, col: c });

    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      const nkey = `${nr},${nc}`;
      if (!inBounds(nr, nc) || grid[nr][nc] === "wall" || closed.has(nkey)) continue;
      const newG = (g.get(key) ?? 0) + 1;
      if (newG < (g.get(nkey) ?? Infinity)) {
        g.set(nkey, newG);
        prev.set(nkey, [r, c]);
        open.push({ row: nr, col: nc, g: newG, f: newG + h(nr, nc) });
        if (grid[nr][nc] !== "end") steps.push({ type: "frontier", row: nr, col: nc });
      }
    }
  }
  steps.push({ type: "no_path" });
  return steps;
}

const COMPUTE: Record<Algo, typeof bfsSteps> = {
  bfs: bfsSteps,
  dfs: dfsSteps,
  astar: astarSteps,
};

const ALGO_DESC: Record<Algo, string> = {
  bfs:   "camadas — garante caminho mínimo",
  dfs:   "profundidade — não garante mínimo",
  astar: "heurística — mais eficiente que BFS",
};

const SPEED: Record<string, { ms: number; batch: number }> = {
  devagar: { ms: 30, batch: 1 },
  normal:  { ms: 16, batch: 3 },
  rápido:  { ms: 16, batch: 12 },
};

export function PathfindingVisualizer() {
  const startRef = useRef<[number, number]>([...START_INIT]);
  const endRef   = useRef<[number, number]>([...END_INIT]);
  const drawMode = useRef<DrawMode>("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);
  const gridRef  = useRef<Grid>(makeGrid(...START_INIT, ...END_INIT));

  const [grid, setGrid] = useState<Grid>(() => gridRef.current);
  const [algo, setAlgo]   = useState<Algo>("bfs");
  const [speed, setSpeed] = useState<string>("normal");
  const [running, setRunning] = useState(false);
  const [noPath, setNoPath]   = useState(false);
  const [visited, setVisited] = useState(0);
  const [pathLen, setPathLen] = useState<number | null>(null);

  function syncGrid(g: Grid) {
    gridRef.current = g;
    setGrid(g);
  }

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function setNotRunning() {
    stopTimer();
    setRunning(false);
    runningRef.current = false;
  }

  function reset() {
    setNotRunning();
    startRef.current = [...START_INIT];
    endRef.current   = [...END_INIT];
    const g = makeGrid(...START_INIT, ...END_INIT);
    syncGrid(g);
    setNoPath(false); setVisited(0); setPathLen(null);
  }

  function clearWalls() {
    setNotRunning();
    const g = clearViz(gridRef.current.map((row) =>
      row.map((c): CellStatus => (c === "wall" ? "empty" : c))
    ));
    syncGrid(g);
    setNoPath(false); setVisited(0); setPathLen(null);
  }

  function randomMaze() {
    setNotRunning();
    const [sr, sc] = startRef.current;
    const [er, ec] = endRef.current;
    const g = makeGrid(sr, sc, er, ec);
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (g[r][c] === "empty" && Math.random() < 0.28) g[r][c] = "wall";
    syncGrid(g);
    setNoPath(false); setVisited(0); setPathLen(null);
  }

  function startVisualization() {
    if (runningRef.current) return;
    stopTimer();
    const base = clearViz(gridRef.current);
    syncGrid(base);
    setRunning(true); runningRef.current = true;
    setNoPath(false); setVisited(0); setPathLen(null);

    const steps = COMPUTE[algo](base, startRef.current, endRef.current);
    let i = 0;
    let totalVisited = 0;
    const { ms, batch } = SPEED[speed];

    timerRef.current = setInterval(() => {
      if (i >= steps.length) { setNotRunning(); return; }

      let localV = 0;
      let done = false;
      let foundPathLen: number | null = null;
      let foundNoPath = false;

      setGrid((prev) => {
        const next = prev.map((row) => [...row]) as Grid;

        for (let b = 0; b < batch && i < steps.length; b++) {
          const step = steps[i++];
          if (step.type === "visit") {
            localV++;
            if (next[step.row][step.col] !== "start" && next[step.row][step.col] !== "end")
              next[step.row][step.col] = "visited";
          } else if (step.type === "frontier") {
            const cur = next[step.row][step.col];
            if (cur !== "start" && cur !== "end" && cur !== "visited")
              next[step.row][step.col] = "frontier";
          } else if (step.type === "path") {
            foundPathLen = step.cells.length - 1;
            done = true;
            for (const [r, c] of step.cells)
              if (next[r][c] !== "start" && next[r][c] !== "end")
                next[r][c] = "path";
          } else if (step.type === "no_path") {
            foundNoPath = true;
            done = true;
          }
        }
        return next;
      });

      if (localV > 0) {
        totalVisited += localV;
        setVisited(totalVisited);
      }
      if (foundPathLen !== null) setPathLen(foundPathLen);
      if (foundNoPath) setNoPath(true);
      if (done || i >= steps.length) setNotRunning();
    }, ms);
  }

  const handleMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (runningRef.current) return;
      const cell = gridRef.current[row][col];
      if (cell === "start") {
        drawMode.current = "move-start";
      } else if (cell === "end") {
        drawMode.current = "move-end";
      } else if (e.button === 2 || cell === "wall") {
        drawMode.current = "erase-wall";
        setGrid((prev) => {
          if (prev[row][col] !== "wall") return prev;
          const next = prev.map((r) => [...r]) as Grid;
          next[row][col] = "empty";
          gridRef.current = next;
          return next;
        });
      } else {
        drawMode.current = "draw-wall";
        setGrid((prev) => {
          const c = prev[row][col];
          if (c === "start" || c === "end" || c === "wall") return prev;
          const next = prev.map((r) => [...r]) as Grid;
          next[row][col] = "wall";
          gridRef.current = next;
          return next;
        });
      }
    },
    []
  );

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (runningRef.current) return;
    const mode = drawMode.current;

    if (mode === "draw-wall") {
      setGrid((prev) => {
        const c = prev[row][col];
        if (c === "start" || c === "end" || c === "wall") return prev;
        const next = prev.map((r) => [...r]) as Grid;
        next[row][col] = "wall";
        gridRef.current = next;
        return next;
      });
    } else if (mode === "erase-wall") {
      setGrid((prev) => {
        if (prev[row][col] !== "wall") return prev;
        const next = prev.map((r) => [...r]) as Grid;
        next[row][col] = "empty";
        gridRef.current = next;
        return next;
      });
    } else if (mode === "move-start") {
      const [pr, pc] = startRef.current;
      if (row === pr && col === pc) return;
      setGrid((prev) => {
        if (prev[row][col] === "end" || prev[row][col] === "wall") return prev;
        const next = prev.map((r) => [...r]) as Grid;
        next[pr][pc] = "empty";
        next[row][col] = "start";
        startRef.current = [row, col];
        gridRef.current = next;
        return next;
      });
    } else if (mode === "move-end") {
      const [pr, pc] = endRef.current;
      if (row === pr && col === pc) return;
      setGrid((prev) => {
        if (prev[row][col] === "start" || prev[row][col] === "wall") return prev;
        const next = prev.map((r) => [...r]) as Grid;
        next[pr][pc] = "empty";
        next[row][col] = "end";
        endRef.current = [row, col];
        gridRef.current = next;
        return next;
      });
    }
  }, []);

  useEffect(() => {
    const up = () => { drawMode.current = "idle"; };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  useEffect(() => () => stopTimer(), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-start">
        <div className="space-y-1.5">
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            {(["bfs", "dfs", "astar"] as Algo[]).map((a) => (
              <button
                key={a}
                onClick={() => { if (!runningRef.current) setAlgo(a); }}
                className={`px-4 py-2 text-sm font-mono font-semibold transition-colors ${
                  algo === a
                    ? "bg-blue-600 text-white"
                    : "bg-[#0d1117] text-slate-400 hover:text-white"
                }`}
              >
                {a === "astar" ? "A*" : a.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-xs font-mono text-slate-500 pl-1">
            {ALGO_DESC[algo]}
          </p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-slate-700">
          {(["devagar", "normal", "rápido"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-3 py-2 text-xs font-mono transition-colors ${
                speed === s
                  ? "bg-slate-600 text-white"
                  : "bg-[#0d1117] text-slate-400 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto flex-wrap">
          <button
            onClick={randomMaze}
            disabled={running}
            className="px-3 py-2 text-xs font-mono bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition-colors"
          >
            labirinto aleatório
          </button>
          <button
            onClick={clearWalls}
            disabled={running}
            className="px-3 py-2 text-xs font-mono bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition-colors"
          >
            limpar paredes
          </button>
          <button
            onClick={reset}
            disabled={running}
            className="px-3 py-2 text-xs font-mono bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition-colors"
          >
            resetar
          </button>
          <button
            onClick={startVisualization}
            disabled={running}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {running ? "rodando…" : "▶ iniciar"}
          </button>
        </div>
      </div>

      <div
        className="select-none rounded-xl border border-slate-700 overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: "1px",
            backgroundColor: "#0f172a",
            padding: "1px",
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  aspectRatio: "1",
                  backgroundColor: COLORS[cell],
                  cursor: running ? "default" : "crosshair",
                  transition:
                    cell === "wall" || cell === "start" || cell === "end"
                      ? "none"
                      : "background-color 80ms",
                }}
                onMouseDown={(e) => handleMouseDown(r, c, e)}
                onMouseEnter={() => handleMouseEnter(r, c)}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
        <div className="flex gap-5 text-xs font-mono">
          <span className="text-slate-500">
            visitados:{" "}
            <span className="text-blue-400 tabular-nums">{visited}</span>
          </span>
          {pathLen !== null && (
            <span className="text-slate-500">
              caminho:{" "}
              <span className="text-yellow-400 tabular-nums">
                {pathLen} passos
              </span>
            </span>
          )}
          {noPath && (
            <span className="text-red-400">sem caminho disponível</span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-mono text-slate-500 ml-auto">
          {(
            [
              ["start",    "início (arrastar)"],
              ["end",      "fim (arrastar)"],
              ["wall",     "parede"],
              ["frontier", "fronteira"],
              ["visited",  "visitado"],
              ["path",     "caminho"],
            ] as [CellStatus, string][]
          ).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: COLORS[status] }}
              />
              {label}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-600 font-mono">
        clique/arraste → parede · botão direito → apagar ·
        arraste o verde ou vermelho para mover início/fim
      </p>
    </div>
  );
}
