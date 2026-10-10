"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdivinheRodada } from "@/hooks/useAdivinheRodada";
import { StepControls } from "@/components/ui/StepControls";
import { StepNarrator } from "@/components/ui/StepNarrator";
import { BotoesPalpite } from "@/components/jogo/BotoesPalpite";
import { PassosGenericoVisual } from "@/components/jogo/PassosGenericoVisual";
import { Veredito } from "@/components/jogo/Veredito";
import type { Estrutura } from "@/lib/api";

type Props = {
  seedInicial?: number;
};

export function AdivinheClient({ seedInicial }: Props) {
  const { rodada, veredito, carregando, erro, carregarRodada, enviarPalpite } =
    useAdivinheRodada(seedInicial);

  const [indice, setIndice] = useState(0);

  useEffect(() => {
    setIndice(0);
  }, [rodada]);

  const total = rodada?.passos.length ?? 0;
  const passoAtual = rodada && total > 0 ? rodada.passos[indice] : null;

  const avancar = useCallback(() => {
    setIndice((i) => (i < total - 1 ? i + 1 : i));
  }, [total]);
  const voltar = useCallback(() => {
    setIndice((i) => (i > 0 ? i - 1 : i));
  }, []);
  const resetar = useCallback(() => setIndice(0), []);

  const aoPalpitar = useCallback(
    (e: Estrutura) => {
      void enviarPalpite(e);
    },
    [enviarPalpite]
  );

  const aoProxima = useCallback(() => {
    void carregarRodada();
  }, [carregarRodada]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Adivinhe a Estrutura
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Observe a sequência de passos de uma operação sem rótulo. Identifique
          qual das 7 estruturas está sendo demonstrada pela mecânica.
        </p>
      </header>

      {erro && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {erro}
        </div>
      )}

      {rodada && total > 0 && (
        <div className="flex flex-col gap-6">
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

          <div className="border-t border-white/10 pt-6">
            <p className="mb-3 text-sm text-white/60">
              Qual estrutura você acha que está sendo demonstrada?
            </p>
            <BotoesPalpite
              onPalpite={aoPalpitar}
              desabilitado={carregando || veredito !== null}
            />
          </div>

          {veredito && (
            <Veredito veredito={veredito} onProxima={aoProxima} />
          )}
        </div>
      )}

      {carregando && !rodada && (
        <p className="text-sm text-white/60">Sorteando rodada…</p>
      )}
    </main>
  );
}
