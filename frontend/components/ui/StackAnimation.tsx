"use client";

import { useEffect, useState } from "react";

const MAX_DEPTH = 4;

type FrameData = {
  label: string;
  retorno: number | null;
};

type Step = {
  frames: FrameData[];
  action: "push" | "pop" | "idle";
  delay: number;
};

const STEPS: Step[] = [
  { frames: [], action: "idle", delay: 700 },
  {
    frames: [{ label: "fatorial(4)", retorno: null }],
    action: "push",
    delay: 850,
  },
  {
    frames: [
      { label: "fatorial(4)", retorno: null },
      { label: "fatorial(3)", retorno: null },
    ],
    action: "push",
    delay: 850,
  },
  {
    frames: [
      { label: "fatorial(4)", retorno: null },
      { label: "fatorial(3)", retorno: null },
      { label: "fatorial(2)", retorno: null },
    ],
    action: "push",
    delay: 850,
  },
  {
    frames: [
      { label: "fatorial(4)", retorno: null },
      { label: "fatorial(3)", retorno: null },
      { label: "fatorial(2)", retorno: null },
      { label: "fatorial(1)", retorno: null },
    ],
    action: "push",
    delay: 1100,
  },
  {
    frames: [
      { label: "fatorial(4)", retorno: null },
      { label: "fatorial(3)", retorno: null },
      { label: "fatorial(2)", retorno: null },
      { label: "fatorial(1)", retorno: 1 },
    ],
    action: "pop",
    delay: 650,
  },
  {
    frames: [
      { label: "fatorial(4)", retorno: null },
      { label: "fatorial(3)", retorno: null },
      { label: "fatorial(2)", retorno: 2 },
    ],
    action: "pop",
    delay: 650,
  },
  {
    frames: [
      { label: "fatorial(4)", retorno: null },
      { label: "fatorial(3)", retorno: 6 },
    ],
    action: "pop",
    delay: 650,
  },
  {
    frames: [{ label: "fatorial(4)", retorno: 24 }],
    action: "pop",
    delay: 650,
  },
  { frames: [], action: "idle", delay: 1300 },
];

export function StackAnimation() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setTimeout(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, step.delay);
    return () => clearTimeout(id);
  }, [stepIndex, step.delay]);

  const isPop = step.action === "pop";

  return (
    <div className="select-none rounded-xl border border-slate-700 bg-[#161b27] overflow-hidden shadow-xl shadow-black/30">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-700/50 bg-[#0d1117]/70">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="ml-3 text-slate-500 text-xs font-mono">
          pilha de chamadas
        </span>
        <span
          className={`ml-auto text-xs font-mono transition-colors duration-300 ${
            step.action === "push"
              ? "text-blue-400"
              : step.action === "pop"
                ? "text-green-400"
                : "text-slate-700"
          }`}
        >
          {step.action === "push"
            ? "push()"
            : step.action === "pop"
              ? "pop()"
              : "·"}
        </span>
      </div>

      <div className="px-4 pt-4 pb-2 space-y-1.5 min-h-[196px] flex flex-col justify-end">
        {Array.from({ length: MAX_DEPTH }, (_, slotIndex) => {
          const frameIndex = MAX_DEPTH - 1 - slotIndex;
          const frame = step.frames[frameIndex] ?? null;
          const isTop = frame !== null && frameIndex === step.frames.length - 1;
          const hiddenTransform = isPop ? "-translate-y-1" : "translate-y-2";

          return (
            <div key={slotIndex} className="h-10">
              <div
                className={`h-full flex items-center px-3 rounded border font-mono text-xs transition-all duration-300 ${
                  frame
                    ? isTop
                      ? "opacity-100 translate-y-0 bg-blue-950/70 border-blue-500/70 text-blue-100 shadow-sm shadow-blue-900/50"
                      : "opacity-100 translate-y-0 bg-slate-800/70 border-slate-600/80 text-slate-300"
                    : `opacity-0 ${hiddenTransform} border-transparent bg-transparent pointer-events-none`
                }`}
              >
                {frame && (
                  <>
                    <span className="text-slate-600 w-3 mr-2.5 text-right shrink-0">
                      {frameIndex + 1}
                    </span>
                    <span className={isTop ? "text-blue-200" : "text-slate-300"}>
                      {frame.label}
                    </span>
                    {frame.retorno !== null && (
                      <span className="ml-2 text-green-400 transition-all duration-200">
                        → {frame.retorno}
                      </span>
                    )}
                    {isTop && (
                      <span className="ml-auto pl-3 text-blue-500/50 shrink-0">
                        ← topo
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2.5 border-t border-slate-700/50 bg-[#0d1117]/40 flex items-center gap-2 font-mono text-xs">
        <span className="text-slate-600">frames:</span>
        <span className="text-slate-400">{step.frames.length}</span>
        <span className="text-slate-700">·</span>
        <span
          className={`transition-colors duration-300 ${
            step.action === "push"
              ? "text-blue-400"
              : step.action === "pop"
                ? "text-green-400"
                : "text-slate-700"
          }`}
        >
          {step.action !== "idle" ? step.action : "—"}
        </span>
        <div className="ml-auto flex gap-1">
          {Array.from({ length: MAX_DEPTH }, (_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i < step.frames.length ? "bg-blue-500" : "bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
