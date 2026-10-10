"use client";

import { useEffect } from "react";

export type AtalhosCallbacks = {
  onNumero?: (idx: 0 | 1 | 2 | 3) => void;
  onConfirmar?: () => void;
  onEsquerda?: () => void;
  onDireita?: () => void;
};

function focoEmInput(): boolean {
  const el = document.activeElement;
  if (el === null) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA";
}

export function useAtalhosRodada(
  callbacks: AtalhosCallbacks,
  deps: unknown[] = []
): void {
  useEffect(() => {
    function handler(ev: KeyboardEvent) {
      if (focoEmInput()) return;
      switch (ev.key) {
        case "1":
        case "2":
        case "3":
        case "4": {
          const idx = (Number(ev.key) - 1) as 0 | 1 | 2 | 3;
          callbacks.onNumero?.(idx);
          break;
        }
        case "Enter":
          callbacks.onConfirmar?.();
          break;
        case "ArrowLeft":
          callbacks.onEsquerda?.();
          break;
        case "ArrowRight":
        case " ":
          callbacks.onDireita?.();
          break;
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
