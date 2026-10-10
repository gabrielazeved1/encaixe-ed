"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getRodada,
  postPalpite,
  type Estrutura,
  type RodadaResult,
  type VereditoResult,
} from "@/lib/api";

export type UseAdivinheRodadaResult = {
  rodada: RodadaResult | null;
  veredito: VereditoResult | null;
  carregando: boolean;
  erro: string | null;
  carregarRodada: (seed?: number) => Promise<void>;
  enviarPalpite: (palpite: Estrutura) => Promise<void>;
};

export function useAdivinheRodada(
  seedInicial?: number
): UseAdivinheRodadaResult {
  const [rodada, setRodada] = useState<RodadaResult | null>(null);
  const [veredito, setVeredito] = useState<VereditoResult | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inicializou = useRef(false);

  const carregarRodada = useCallback(async (seed?: number) => {
    setCarregando(true);
    setErro(null);
    setVeredito(null);
    try {
      const r = await getRodada(seed);
      setRodada(r);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "erro ao carregar rodada");
    } finally {
      setCarregando(false);
    }
  }, []);

  const enviarPalpite = useCallback(
    async (palpite: Estrutura) => {
      if (!rodada) return;
      setCarregando(true);
      setErro(null);
      try {
        const v = await postPalpite(rodada.token, palpite);
        setVeredito(v);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "erro ao enviar palpite");
      } finally {
        setCarregando(false);
      }
    },
    [rodada]
  );

  useEffect(() => {
    if (inicializou.current) return;
    inicializou.current = true;
    void carregarRodada(seedInicial);
  }, [carregarRodada, seedInicial]);

  return {
    rodada,
    veredito,
    carregando,
    erro,
    carregarRodada,
    enviarPalpite,
  };
}
