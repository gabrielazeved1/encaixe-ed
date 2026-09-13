"use client";

import { useState, useCallback } from "react";
import { memoriaSimular, AlocadorResult, Operacao } from "@/lib/api";

type Estado = {
  resultado: AlocadorResult | null;
  loading: boolean;
  erro: string | null;
};

export function useAlocadorMemoria() {
  const [estado, setEstado] = useState<Estado>({
    resultado: null,
    loading: false,
    erro: null,
  });

  const simular = useCallback(async (operacoes: Operacao[]) => {
    setEstado({ resultado: null, loading: true, erro: null });
    try {
      const resultado = await memoriaSimular(operacoes);
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
