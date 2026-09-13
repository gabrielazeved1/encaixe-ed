"use client";

import { useState, useCallback } from "react";
import { escalonadorSimular, EscalonadorResult, Processo } from "@/lib/api";

type Estado = {
  resultado: EscalonadorResult | null;
  loading: boolean;
  erro: string | null;
};

export function useEscalonador() {
  const [estado, setEstado] = useState<Estado>({
    resultado: null,
    loading: false,
    erro: null,
  });

  const simular = useCallback(
    async (processos: Processo[], algoritmo: string, quantum?: number) => {
      setEstado({ resultado: null, loading: true, erro: null });
      try {
        const resultado = await escalonadorSimular(processos, algoritmo, quantum);
        setEstado({ resultado, loading: false, erro: null });
      } catch (e) {
        setEstado({
          resultado: null,
          loading: false,
          erro: e instanceof Error ? e.message : "Erro desconhecido",
        });
      }
    },
    []
  );

  return { ...estado, simular };
}
