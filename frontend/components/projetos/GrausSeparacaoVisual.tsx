"use client";

import { useState, useMemo } from "react";
import type { Pessoa, Amizade } from "@/lib/api";

type Props = {
  pessoas: Pessoa[];
  amizades: Amizade[];
  caminho: string[];
  graus: number;
  niveis: { nivel: number; nos: string[] }[];
  nomesCaminho: string[];
};

type Ponto = { x: number; y: number };

function calcularPosicoes(pessoas: Pessoa[]): Record<string, Ponto> {
  const n = pessoas.length;
  const cx = 160;
  const cy = 130;
  const r = 100;
  const posicoes: Record<string, Ponto> = {};
  pessoas.forEach((p, i) => {
    const angulo = (2 * Math.PI * i) / n - Math.PI / 2;
    posicoes[p.id] = {
      x: cx + r * Math.cos(angulo),
      y: cy + r * Math.sin(angulo),
    };
  });
  return posicoes;
}

type BfsEstado = {
  descricao: string;
  visitados: Set<string>;
  fronteira: Set<string>;
  filaExibida: string[];
  mostrarCaminho: boolean;
};

function derivarPassos(
  niveis: { nivel: number; nos: string[] }[],
  caminho: string[],
  nomesPorId: Record<string, string>
): BfsEstado[] {
  if (niveis.length === 0) return [];
  const passos: BfsEstado[] = [];
  const visitados = new Set<string>();

  const nome = (id: string) => nomesPorId[id] ?? id;

  const origem = niveis[0]?.nos[0];
  if (!origem) return [];

  visitados.add(origem);
  passos.push({
    descricao: `BFS inicia em ${nome(origem)}. Adicionando à fila de exploração.`,
    visitados: new Set(visitados),
    fronteira: new Set([origem]),
    filaExibida: [nome(origem)],
    mostrarCaminho: false,
  });

  for (let i = 0; i < niveis.length - 1; i++) {
    const proximo = niveis[i + 1];
    if (!proximo || proximo.nos.length === 0) continue;
    proximo.nos.forEach((id) => visitados.add(id));
    const novosNomes = proximo.nos.map(nome);
    passos.push({
      descricao: `Nível ${i + 1}: processando vizinhos → descobrindo ${novosNomes.join(", ")}. Adicionando à fila.`,
      visitados: new Set(visitados),
      fronteira: new Set(proximo.nos),
      filaExibida: proximo.nos.map(nome),
      mostrarCaminho: false,
    });
  }

  if (caminho.length > 0 && caminho[caminho.length - 1] !== origem) {
    caminho.forEach((id) => visitados.add(id));
    const dest = caminho[caminho.length - 1];
    passos.push({
      descricao: `${nome(dest)} encontrado! Caminho: ${caminho.map(nome).join(" → ")} (${caminho.length - 1} ${caminho.length - 1 === 1 ? "grau" : "graus"}).`,
      visitados: new Set(visitados),
      fronteira: new Set(),
      filaExibida: [],
      mostrarCaminho: true,
    });
  } else {
    passos.push({
      descricao: "Sem caminho entre os dois nós.",
      visitados: new Set(visitados),
      fronteira: new Set(),
      filaExibida: [],
      mostrarCaminho: false,
    });
  }

  return passos;
}

function GrafoSVG({
  pessoas,
  amizades,
  posicoes,
  visitados,
  fronteira,
  caminho,
  mostrarCaminho,
  origem,
  destino,
}: {
  pessoas: Pessoa[];
  amizades: Amizade[];
  posicoes: Record<string, Ponto>;
  visitados: Set<string>;
  fronteira: Set<string>;
  caminho: string[];
  mostrarCaminho: boolean;
  origem: string;
  destino: string;
}) {
  const caminhoSet = new Set(caminho);
  const arestasPath = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < caminho.length - 1; i++) {
      s.add([caminho[i], caminho[i + 1]].sort().join("|"));
    }
    return s;
  }, [caminho]);

  return (
    <svg viewBox="0 0 320 260" className="w-full max-w-xs mx-auto">
      {amizades.map((a) => {
        const pa = posicoes[a.a];
        const pb = posicoes[a.b];
        if (!pa || !pb) return null;
        const key = [a.a, a.b].sort().join("|");
        const emPath = mostrarCaminho && arestasPath.has(key);
        return (
          <line
            key={key}
            x1={pa.x} y1={pa.y}
            x2={pb.x} y2={pb.y}
            stroke={emPath ? "#34d399" : "#334155"}
            strokeWidth={emPath ? 2.5 : 1.5}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        );
      })}

      {pessoas.map((p) => {
        const pos = posicoes[p.id];
        if (!pos) return null;
        const emCaminho = mostrarCaminho && caminhoSet.has(p.id);
        const naFronteira = fronteira.has(p.id) && !mostrarCaminho;
        const visitado = visitados.has(p.id) && !naFronteira && !emCaminho;
        const isOrigem = p.id === origem;
        const isDestino = p.id === destino;

        let circleFill = "#1e293b";
        let circleStroke = "#475569";
        let textColor = "#94a3b8";

        if (emCaminho) {
          circleFill = "#064e3b";
          circleStroke = "#34d399";
          textColor = "#6ee7b7";
        } else if (naFronteira) {
          circleFill = "#1e1b4b";
          circleStroke = "#818cf8";
          textColor = "#c7d2fe";
        } else if (visitado) {
          circleFill = "#1e2a4a";
          circleStroke = "#3b82f6";
          textColor = "#93c5fd";
        }

        return (
          <g key={p.id} className="transition-all duration-300">
            <circle
              cx={pos.x} cy={pos.y} r={22}
              fill={circleFill}
              stroke={circleStroke}
              strokeWidth={emCaminho || naFronteira ? 2.5 : 1.5}
            />
            {(isOrigem || isDestino) && !emCaminho && (
              <circle
                cx={pos.x} cy={pos.y} r={26}
                fill="none"
                stroke={isOrigem ? "#f59e0b" : "#f43f5e"}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.7}
              />
            )}
            <text
              x={pos.x} y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontFamily="ui-monospace, monospace"
              fill={textColor}
              className="select-none"
            >
              {p.nome.length > 6 ? p.nome.slice(0, 5) + "…" : p.nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function GrausSeparacaoVisual({
  pessoas,
  amizades,
  caminho,
  graus,
  niveis,
  nomesCaminho,
}: Props) {
  const [passo, setPasso] = useState(0);

  const nomesPorId = useMemo(
    () => Object.fromEntries(pessoas.map((p) => [p.id, p.nome])),
    [pessoas]
  );

  const posicoes = useMemo(() => calcularPosicoes(pessoas), [pessoas]);

  const passos = useMemo(
    () => derivarPassos(niveis, caminho, nomesPorId),
    [niveis, caminho, nomesPorId]
  );

  const origem = niveis[0]?.nos[0] ?? "";
  const destino = caminho[caminho.length - 1] ?? "";

  if (graus < 0) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-500/40 px-4 py-3 text-center text-red-300 font-mono text-sm">
        Sem conexão entre as pessoas
      </div>
    );
  }

  const estadoAtual = passos[passo] ?? passos[passos.length - 1];
  if (!estadoAtual) return null;

  const podeAvancar = passo < passos.length - 1;
  const podeVoltar = passo > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-[#0d1117] border border-slate-700 p-3">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-mono text-slate-500">BFS — Busca em Largura</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {graus} {graus === 1 ? "grau" : "graus"} de separação
          </span>
          <span className="ml-auto text-xs font-mono text-slate-600">
            passo {passo + 1} / {passos.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
          <GrafoSVG
            pessoas={pessoas}
            amizades={amizades}
            posicoes={posicoes}
            visitados={estadoAtual.visitados}
            fronteira={estadoAtual.fronteira}
            caminho={caminho}
            mostrarCaminho={estadoAtual.mostrarCaminho}
            origem={origem}
            destino={destino}
          />

          <div className="space-y-3 min-w-[160px]">
            <div className="rounded border border-slate-700 bg-slate-900/50 px-3 py-2 text-xs font-mono text-slate-300 leading-relaxed">
              {estadoAtual.descricao}
            </div>

            {estadoAtual.filaExibida.length > 0 && (
              <div>
                <p className="text-[10px] font-mono text-slate-500 mb-1">fila BFS:</p>
                <div className="flex flex-wrap gap-1">
                  {estadoAtual.filaExibida.map((nome, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-900/40 border border-indigo-500/30 text-indigo-300"
                    >
                      {nome}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {estadoAtual.mostrarCaminho && (
              <div>
                <p className="text-[10px] font-mono text-slate-500 mb-1">caminho mínimo:</p>
                <div className="flex flex-wrap items-center gap-1">
                  {nomesCaminho.map((nome, i) => (
                    <span key={i} className="inline-flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-900/40 border border-emerald-500/30 text-emerald-300">
                        {nome}
                      </span>
                      {i < nomesCaminho.length - 1 && (
                        <span className="text-slate-600 text-[10px]">→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
                <span className="inline-block w-2 h-2 rounded-full border border-amber-400 border-dashed" />
                origem/destino
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-[10px] font-mono text-indigo-400">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-900 border border-indigo-400" />
                fronteira
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-blue-400">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-900/40 border border-blue-400" />
                visitado
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-900/40 border border-emerald-400" />
                caminho
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            type="button"
            disabled={!podeVoltar}
            onClick={() => setPasso((p) => Math.max(0, p - 1))}
            className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono disabled:opacity-30 hover:border-slate-500 transition-colors"
          >
            ← anterior
          </button>
          <span className="text-xs font-mono text-slate-500">
            {Array.from({ length: passos.length }, (_, i) => (
              <span
                key={i}
                onClick={() => setPasso(i)}
                className={`inline-block w-2 h-2 rounded-full mx-0.5 cursor-pointer transition-colors ${
                  i === passo ? "bg-indigo-400" : "bg-slate-700 hover:bg-slate-500"
                }`}
              />
            ))}
          </span>
          <button
            type="button"
            disabled={!podeAvancar}
            onClick={() => setPasso((p) => Math.min(passos.length - 1, p + 1))}
            className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono disabled:opacity-30 hover:border-slate-500 transition-colors"
          >
            próximo →
          </button>
        </div>
      </div>
    </div>
  );
}
