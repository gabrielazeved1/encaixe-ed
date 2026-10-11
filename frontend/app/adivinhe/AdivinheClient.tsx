"use client";

import { useCallback, useState } from "react";
import { useAdivinheRodada } from "@/hooks/useAdivinheRodada";
import { useAtalhosRodada } from "@/hooks/useAtalhosRodada";
import { StepControls } from "@/components/ui/StepControls";
import { AdivinheVisual } from "@/components/jogo/AdivinheVisual";
import type { PerguntaComResposta } from "@/lib/api";

type Props = {
  seedInicial?: number;
};

const DIFICULDADE: Record<string, { label: string; cor: string }> = {
  estrutura: {
    label: "Fácil",
    cor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  operacao: {
    label: "Médio",
    cor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  complexidade: {
    label: "Difícil",
    cor: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  },
};

const LETRAS = ["A", "B", "C", "D"] as const;

type PerguntaCardProps = {
  pergunta: PerguntaComResposta;
  selecionada: number | null;
  acertou: boolean | null;
  verificado: boolean;
  onSelecionar: (idx: number) => void;
};

function PerguntaCard({
  pergunta,
  selecionada,
  acertou,
  verificado,
  onSelecionar,
}: PerguntaCardProps) {
  const dif = DIFICULDADE[pergunta.camada];
  const correto = pergunta.indice_correto;
  const explicacao = verificado
    ? acertou
      ? pergunta.explicacao_acerto
      : pergunta.explicacao_erro
    : null;

  function classeOpcao(idx: number): string {
    const base =
      "flex items-start gap-2.5 w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors";
    if (!verificado) {
      if (selecionada === idx)
        return `${base} border-blue-500 bg-blue-900/30 text-white`;
      return `${base} border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:text-white`;
    }
    if (idx === correto)
      return `${base} border-emerald-500 bg-emerald-900/25 text-emerald-200`;
    if (selecionada === idx && !acertou)
      return `${base} border-red-500 bg-red-900/25 text-red-200`;
    return `${base} border-slate-800 bg-slate-900/40 text-slate-500`;
  }

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 transition-colors ${
        verificado
          ? acertou
            ? "border-emerald-700/50 bg-[#0d1f14]"
            : "border-amber-700/50 bg-[#1f1508]"
          : "border-slate-700 bg-[#161b27]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs leading-relaxed text-slate-300">{pergunta.enunciado}</p>
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${dif.cor}`}
        >
          {dif.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {pergunta.alternativas.map((alt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={verificado}
            onClick={() => onSelecionar(idx)}
            className={classeOpcao(idx)}
          >
            <span className="shrink-0 font-mono text-xs font-semibold text-slate-500">
              {LETRAS[idx]}
            </span>
            <span>{alt}</span>
            {verificado && idx === correto && (
              <span className="ml-auto text-emerald-400 text-sm">✓</span>
            )}
            {verificado && idx === selecionada && !acertou && idx !== correto && (
              <span className="ml-auto text-red-400 text-sm">✗</span>
            )}
          </button>
        ))}
      </div>

      {explicacao && (
        <p className="text-xs leading-relaxed text-slate-400 border-t border-slate-700/50 pt-2">
          {explicacao}
        </p>
      )}
    </div>
  );
}

function Estrelas({ pontuacao }: { pontuacao: 0 | 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-3xl" aria-label={`${pontuacao} de 3 acertos`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={i < pontuacao ? "text-amber-400" : "text-slate-600"}>
            ★
          </span>
        ))}
      </span>
      <span className="text-sm text-slate-400">
        {pontuacao} de 3 correto{pontuacao !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

export function AdivinheClient({ seedInicial }: Props) {
  const { estado, rodada, respostas, pontuacao, erro, selecionar, verificar, proximaRodada } =
    useAdivinheRodada(seedInicial);

  const [indice, setIndice] = useState(0);

  const total = rodada?.passos.length ?? 0;
  const passo = rodada && total > 0 ? rodada.passos[Math.min(indice, total - 1)] : null;

  const avancar = useCallback(() => setIndice((i) => Math.min(total - 1, i + 1)), [total]);
  const voltar = useCallback(() => setIndice((i) => Math.max(0, i - 1)), []);
  const resetar = useCallback(() => setIndice(0), []);

  useAtalhosRodada(
    { onEsquerda: voltar, onDireita: avancar },
    [voltar, avancar]
  );

  const todasRespondidas = respostas.every((r) => r.selecionada !== null);

  if (estado === "carregando") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-sm text-slate-500">Sorteando rodada…</p>
      </main>
    );
  }

  if (erro || !rodada || !passo) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center space-y-4">
        <p className="text-sm text-red-400">{erro ?? "Erro ao carregar rodada."}</p>
        <button
          onClick={() => void proximaRodada()}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Adivinhe a Estrutura</h1>
        <p className="mt-2 text-sm text-slate-400">
          Observe a demonstração e responda as 3 perguntas. Use ←→ para navegar entre os passos.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <AdivinheVisual estrutura={rodada.estrutura} passo={passo} />

          <div className="rounded-lg border border-slate-800 bg-[#161b27] px-4 py-3">
            <p className="text-xs text-slate-500 mb-1 font-mono uppercase tracking-wider">
              Passo {passo.indice + 1} de {total}
            </p>
            <p className="text-sm text-slate-200 leading-relaxed">{passo.descricao}</p>
            {passo.destaques.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {passo.destaques.map((d) => (
                  <span
                    key={d}
                    className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] text-blue-300"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>

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

        <div className="flex flex-col gap-4">
          {rodada.perguntas.map((pergunta, i) => (
            <PerguntaCard
              key={pergunta.camada}
              pergunta={pergunta}
              selecionada={respostas[i].selecionada}
              acertou={respostas[i].acertou}
              verificado={estado === "verificado"}
              onSelecionar={(alt) => selecionar(i, alt)}
            />
          ))}

          {estado === "respondendo" && (
            <button
              type="button"
              onClick={verificar}
              disabled={!todasRespondidas}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {todasRespondidas ? "Verificar respostas" : "Responda as 3 perguntas para verificar"}
            </button>
          )}

          {estado === "verificado" && pontuacao !== null && (
            <div className="rounded-xl border border-slate-700 bg-[#161b27] px-4 py-4 flex items-center justify-between gap-4">
              <Estrelas pontuacao={pontuacao} />
              <button
                type="button"
                onClick={() => void proximaRodada()}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
              >
                Nova rodada →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
