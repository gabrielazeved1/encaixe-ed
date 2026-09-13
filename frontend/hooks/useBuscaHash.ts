"use client";

import { useState, useCallback } from "react";
import { hashComparar, BuscaHashResult, EntradaHash } from "@/lib/api";

type Estado = {
  resultado: BuscaHashResult | null;
  loading: boolean;
  erro: string | null;
};

export function useBuscaHash() {
  const [estado, setEstado] = useState<Estado>({
    resultado: null,
    loading: false,
    erro: null,
  });

  const simular = useCallback(async (chave: string, dados?: EntradaHash[]) => {
    setEstado({ resultado: null, loading: true, erro: null });
    try {
      const resultado = await hashComparar(chave, dados);
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
