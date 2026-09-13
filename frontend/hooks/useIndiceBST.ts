"use client";

import { useState, useCallback } from "react";
import { bstSimular, BSTResult } from "@/lib/api";

type Estado = {
  resultado: BSTResult | null;
  loading: boolean;
  erro: string | null;
};

export function useIndiceBST() {
  const [estado, setEstado] = useState<Estado>({
    resultado: null,
    loading: false,
    erro: null,
  });

  const simular = useCallback(async (valores: number[], alvo: number) => {
    setEstado({ resultado: null, loading: true, erro: null });
    try {
      const resultado = await bstSimular(valores, alvo);
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
