"use client";

import { useState, useCallback } from "react";
import { roteamentoCalcular, RoteamentoResult, ArestaRot } from "@/lib/api";

type Estado = {
  resultado: RoteamentoResult | null;
  loading: boolean;
  erro: string | null;
};

export function useRoteamento() {
  const [estado, setEstado] = useState<Estado>({
    resultado: null,
    loading: false,
    erro: null,
  });

  const simular = useCallback(
    async (nos: string[], arestas: ArestaRot[], origem: string, destino: string) => {
      setEstado({ resultado: null, loading: true, erro: null });
      try {
        const resultado = await roteamentoCalcular(nos, arestas, origem, destino);
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
