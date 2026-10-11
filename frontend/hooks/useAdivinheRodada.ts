"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRodada, type RodadaResult } from "@/lib/api";

export type EstadoAdivinhe = "carregando" | "respondendo" | "verificado" | "erro";

export type RespostaItem = {
  selecionada: number | null;
  acertou: boolean | null;
};

type TresRespostas = [RespostaItem, RespostaItem, RespostaItem];

const VAZIAS: TresRespostas = [
  { selecionada: null, acertou: null },
  { selecionada: null, acertou: null },
  { selecionada: null, acertou: null },
];

export type UseAdivinheRodadaResult = {
  estado: EstadoAdivinhe;
  rodada: RodadaResult | null;
  respostas: TresRespostas;
  pontuacao: 0 | 1 | 2 | 3 | null;
  erro: string | null;
  selecionar: (perguntaIdx: number, alternativaIdx: number) => void;
  verificar: () => void;
  proximaRodada: () => Promise<void>;
};

export function useAdivinheRodada(seedInicial?: number): UseAdivinheRodadaResult {
  const [estado, setEstado] = useState<EstadoAdivinhe>("carregando");
  const [rodada, setRodada] = useState<RodadaResult | null>(null);
  const [respostas, setRespostas] = useState<TresRespostas>(VAZIAS);
  const [pontuacao, setPontuacao] = useState<0 | 1 | 2 | 3 | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const inicializou = useRef(false);

  const carregarRodada = useCallback(async (seed?: number) => {
    setEstado("carregando");
    setErro(null);
    setRespostas(VAZIAS);
    setPontuacao(null);
    try {
      const r = await getRodada(seed);
      setRodada(r);
      setEstado("respondendo");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "erro ao carregar rodada");
      setEstado("erro");
    }
  }, []);

  const selecionar = useCallback((perguntaIdx: number, alternativaIdx: number) => {
    setRespostas((prev) => {
      const nova = [...prev] as TresRespostas;
      nova[perguntaIdx] = { selecionada: alternativaIdx, acertou: null };
      return nova;
    });
  }, []);

  const verificar = useCallback(() => {
    if (!rodada) return;
    const novas = respostas.map((r, i) => ({
      selecionada: r.selecionada,
      acertou:
        r.selecionada !== null
          ? r.selecionada === rodada.perguntas[i].indice_correto
          : false,
    })) as TresRespostas;
    setRespostas(novas);
    const acertos = novas.filter((r) => r.acertou).length as 0 | 1 | 2 | 3;
    setPontuacao(acertos);
    setEstado("verificado");
  }, [rodada, respostas]);

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
    respostas,
    pontuacao,
    erro,
    selecionar,
    verificar,
    proximaRodada,
  };
}
