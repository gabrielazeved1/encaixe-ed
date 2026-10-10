"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getRodada,
  postPalpite,
  type Camada,
  type PerguntaRevelada,
  type RodadaResult,
  type VereditoParcial,
} from "@/lib/api";

export type EstadoRodada =
  | "carregando"
  | "respondendo"
  | "veredito"
  | "erro";

export type UseAdivinheRodadaResult = {
  estado: EstadoRodada;
  rodada: RodadaResult | null;
  perguntaAtual: PerguntaRevelada | null;
  vereditosParciais: VereditoParcial[];
  pontuacao: 0 | 1 | 2 | 3 | null;
  erro: string | null;
  carregarRodada: (seed?: number) => Promise<void>;
  enviarPalpite: (palpite: string) => Promise<void>;
  proximaRodada: () => Promise<void>;
};

function calcularPontuacao(
  vereditos: VereditoParcial[]
): 0 | 1 | 2 | 3 {
  const acertos = vereditos.filter((v) => v.acertou).length;
  if (acertos === 0) return 0;
  if (acertos === 1) return 1;
  if (acertos === 2) return 2;
  return 3;
}

export function useAdivinheRodada(
  seedInicial?: number
): UseAdivinheRodadaResult {
  const [estado, setEstado] = useState<EstadoRodada>("carregando");
  const [rodada, setRodada] = useState<RodadaResult | null>(null);
  const [perguntaAtual, setPerguntaAtual] =
    useState<PerguntaRevelada | null>(null);
  const [vereditosParciais, setVereditosParciais] = useState<
    VereditoParcial[]
  >([]);
  const [pontuacao, setPontuacao] = useState<0 | 1 | 2 | 3 | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const inicializou = useRef(false);

  const carregarRodada = useCallback(async (seed?: number) => {
    setEstado("carregando");
    setErro(null);
    setVereditosParciais([]);
    setPontuacao(null);
    try {
      const r = await getRodada(seed);
      setRodada(r);
      setPerguntaAtual(r.pergunta_estrutura);
      setEstado("respondendo");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "erro ao carregar rodada");
      setEstado("erro");
    }
  }, []);

  const enviarPalpite = useCallback(
    async (palpite: string) => {
      if (!rodada || !perguntaAtual) return;
      setErro(null);
      try {
        const v = await postPalpite(rodada.token, perguntaAtual.camada, palpite);
        const novos = [...vereditosParciais, v];
        setVereditosParciais(novos);
        if (v.proxima_pergunta !== null) {
          setPerguntaAtual(v.proxima_pergunta);
        } else {
          setPerguntaAtual(null);
          setPontuacao(calcularPontuacao(novos));
          setEstado("veredito");
        }
      } catch (e) {
        setErro(e instanceof Error ? e.message : "erro ao enviar palpite");
        setEstado("erro");
      }
    },
    [rodada, perguntaAtual, vereditosParciais]
  );

  const proximaRodada = useCallback(async () => {
    await carregarRodada();
  }, [carregarRodada]);

  useEffect(() => {
    if (inicializou.current) return;
    inicializou.current = true;
    void carregarRodada(seedInicial);
  }, [carregarRodada, seedInicial]);

  return {
    estado,
    rodada,
    perguntaAtual,
    vereditosParciais,
    pontuacao,
    erro,
    carregarRodada,
    enviarPalpite,
    proximaRodada,
  };
}
