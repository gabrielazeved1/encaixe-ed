"use client";

import { useState, useCallback } from "react";
import { grausBFS, GrausResult, Pessoa, Amizade } from "@/lib/api";

type Estado = {
  resultado: GrausResult | null;
  loading: boolean;
  erro: string | null;
};

export function useGrausSeparacao() {
  const [estado, setEstado] = useState<Estado>({
    resultado: null,
    loading: false,
    erro: null,
  });

  const simular = useCallback(
    async (pessoas: Pessoa[], amizades: Amizade[], origem: string, destino: string) => {
      setEstado({ resultado: null, loading: true, erro: null });
      try {
        const resultado = await grausBFS(pessoas, amizades, origem, destino);
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
