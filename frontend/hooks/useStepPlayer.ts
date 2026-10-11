"use client";

import { useCallback, useEffect, useState } from "react";
import type { Passo } from "@/types/passos";

export type UseStepPlayerResult<E> = {
  indice: number;
  passoAtual: Passo<E> | null;
  totalPassos: number;
  avancar: () => void;
  voltar: () => void;
  resetar: () => void;
  irPara: (i: number) => void;
  podeAvancar: boolean;
  podeVoltar: boolean;
  tocando: boolean;
  velocidade: number;
  tocar: () => void;
  pausar: () => void;
  setVelocidade: (v: number) => void;
};

const INTERVALO_BASE_MS = 800;

export function useStepPlayer<E>(passos: Passo<E>[], indiceInicial = 0): UseStepPlayerResult<E> {
  const [indice, setIndice] = useState(indiceInicial);
  const [tocando, setTocando] = useState(false);
  const [velocidade, setVelocidade] = useState(1);

  useEffect(() => {
    setIndice(indiceInicial);
    setTocando(false);
  }, [passos, indiceInicial]);

  const total = passos.length;
  const podeAvancar = indice < total - 1;
  const podeVoltar = indice > 0;

  const avancar = useCallback(() => {
    setIndice((i) => (i < passos.length - 1 ? i + 1 : i));
  }, [passos.length]);

  const voltar = useCallback(() => {
    setIndice((i) => (i > 0 ? i - 1 : i));
  }, []);

  const resetar = useCallback(() => {
    setIndice(indiceInicial);
    setTocando(false);
  }, [indiceInicial]);

  const irPara = useCallback(
    (i: number) => {
      setIndice(Math.max(0, Math.min(i, passos.length - 1)));
      setTocando(false);
    },
    [passos.length]
  );

  const tocar = useCallback(() => {
    if (passos.length > 0) setTocando(true);
  }, [passos.length]);

  const pausar = useCallback(() => {
    setTocando(false);
  }, []);

  useEffect(() => {
    if (!tocando) return;
    if (indice >= total - 1) {
      setTocando(false);
      return;
    }
    const delay = INTERVALO_BASE_MS / velocidade;
    const id = setTimeout(() => setIndice((i) => i + 1), delay);
    return () => clearTimeout(id);
  }, [tocando, indice, total, velocidade]);

  return {
    indice,
    passoAtual: total > 0 ? passos[indice] : null,
    totalPassos: total,
    avancar,
    voltar,
    resetar,
    irPara,
    podeAvancar,
    podeVoltar,
    tocando,
    velocidade,
    tocar,
    pausar,
    setVelocidade,
  };
}
