"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdivinheRodada } from "@/hooks/useAdivinheRodada";
import { StepControls } from "@/components/ui/StepControls";
import { StepNarrator } from "@/components/ui/StepNarrator";
import { PassosGenericoVisual } from "@/components/jogo/PassosGenericoVisual";
import { PerguntaAcademica } from "@/components/jogo/PerguntaAcademica";
import { ProgressoRodada } from "@/components/jogo/ProgressoRodada";
import { VereditoFinal } from "@/components/jogo/VereditoFinal";
import type { VereditoParcial } from "@/lib/api";

type Props = {
  seedInicial?: number;
};

export function AdivinheClient({ seedInicial }: Props) {
  const {
    estado,
    rodada,
    perguntaAtual,
    vereditosParciais,
    pontuacao,
    erro,
    proximaRodada,
    enviarPalpite,
  } = useAdivinheRodada(seedInicial);

  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setIndice(0);
  }, [rodada]);

  useEffect(() => {
    setSelecionada(null);
  }, [perguntaAtual]);

  const total = rodada?.passos.length ?? 0;
  const passoAtual = rodada && total > 0 ? rodada.passos[indice] : null;

  const avancar = useCallback(() => {
    setIndice((i) => (i < total - 1 ? i + 1 : i));
  }, [total]);
  const voltar = useCallback(() => {
    setIndice((i) => (i > 0 ? i - 1 : i));
  }, []);
  const resetar = useCallback(() => setIndice(0), []);

  const onConfirmar = useCallback(async () => {
    if (perguntaAtual === null || selecionada === null) return;
    setEnviando(true);
    try {
      await enviarPalpite(perguntaAtual.alternativas[selecionada]);
    } finally {
      setEnviando(false);
    }
  }, [perguntaAtual, selecionada, enviarPalpite]);

  const onProxima = useCallback(() => {
    void proximaRodada();
  }, [proximaRodada]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Adivinhe a Estrutura
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Observe a sequência de passos. Em seguida, responda três perguntas
            progressivas: estrutura, operação e complexidade de pior caso.
          </p>
        </div>
        {estado === "respondendo" && perguntaAtual && (
          <ProgressoRodada
            camadaAtual={perguntaAtual.camada}
            vereditosParciais={vereditosParciais}
          />
        )}
      </header>

      {erro && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {erro}
          <button
            type="button"
            onClick={onProxima}
            className="ml-4 rounded border border-red-400 px-3 py-1 text-xs text-red-100 hover:bg-red-500/20"
          >
            Sortear nova rodada
          </button>
        </div>
      )}

      {estado === "carregando" && (
        <p className="text-sm text-white/60">Sorteando rodada…</p>
      )}

      {estado === "respondendo" && rodada && perguntaAtual && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <StepNarrator
              descricao={passoAtual?.descricao ?? null}
              destaques={passoAtual?.destaques ?? []}
              indice={passoAtual?.indice ?? null}
              totalPassos={total}
            />
            <PassosGenericoVisual passo={passoAtual} />
            <StepControls
              indice={indice}
              totalPassos={total}
              podeAvancar={indice < total - 1}
              podeVoltar={indice > 0}
              onVoltar={voltar}
              onAvancar={avancar}
              onResetar={resetar}
            />
          </div>

          <PerguntaAcademica
            pergunta={perguntaAtual}
            selecionada={selecionada}
            onSelecionar={setSelecionada}
            onConfirmar={onConfirmar}
            desabilitado={enviando}
          />
        </div>
      )}

      {estado === "veredito" && pontuacao !== null && (
        <VereditoFinal
          vereditos={
            vereditosParciais as [
              VereditoParcial,
              VereditoParcial,
              VereditoParcial,
            ]
          }
          pontuacao={pontuacao}
          onProxima={onProxima}
        />
      )}
    </main>
  );
}
