"use client";

import { useState, useCallback } from "react";
import { pilhaSimular, SimulacaoResult } from "@/lib/api";

type Estado = {
  resultado: SimulacaoResult | null;
  loading: boolean;
  erro: string | null;
};

export function usePilhaSimulacao() {
  const [estado, setEstado] = useState<Estado>({
    resultado: null,
    loading: false,
    erro: null,
  });

  const simular = useCallback(async (funcao: string, valor: number) => {
    setEstado({ resultado: null, loading: true, erro: null });
    try {
      const resultado = await pilhaSimular(funcao, valor);
      setEstado({ resultado, loading: false, erro: null });
    } catch (e) {
      setEstado({
        resultado: null,
        loading: false,
        erro: e instanceof Error ? e.message : "Erro desconhecido",
      });
    }
  }, []);

  return { ...estado, simular };
}
