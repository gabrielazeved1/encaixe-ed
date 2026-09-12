"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { getProjetoBySlug } from "@/content/projetos";
import { usePilhaSimulacao } from "@/hooks/usePilhaSimulacao";
import { PilhaVisual } from "@/components/projetos/PilhaVisual";
import { SobreEstrutura } from "@/components/projetos/SobreEstrutura";

const FUNCOES = ["fatorial", "fibonacci"] as const;

export default function ProjetoPage() {
  const { slug } = useParams<{ slug: string }>();
  const projeto = getProjetoBySlug(slug);

  const [funcao, setFuncao] = useState<string>("fatorial");
  const [valorInput, setValorInput] = useState<string>("5");
  const [eventoAtual, setEventoAtual] = useState(0);

  const { resultado, loading, erro, simular } = usePilhaSimulacao();

  if (!projeto) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">
        Projeto não encontrado.
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = parseInt(valorInput, 10);
    if (isNaN(v) || v < 1) return;
    setEventoAtual(0);
    await simular(funcao, v);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <header>
        <p className="text-blue-400 text-sm mb-1">{projeto.ed}</p>
        <h1 className="text-2xl font-bold text-gray-100">{projeto.nome}</h1>
        <p className="text-gray-400 mt-2">{projeto.descricao}</p>
      </header>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
        <select
          value={funcao}
          onChange={(e) => setFuncao(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-100 text-sm"
        >
          {FUNCOES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          value={valorInput}
          onChange={(e) => setValorInput(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-100 text-sm w-24"
          placeholder="valor"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded px-4 py-2 text-sm font-medium"
        >
          {loading ? "Simulando…" : "Simular"}
        </button>
      </form>

      {/* Erro */}
      {erro && (
        <p className="text-red-400 text-sm">{erro}</p>
      )}

      {/* Visualização */}
      {resultado && (
        <div className="space-y-4">
          <PilhaVisual
            frames={resultado.frames}
            status={resultado.status}
            eventoAtual={eventoAtual}
          />

          {/* Controles de navegação */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setEventoAtual((n) => Math.max(0, n - 1))}
              disabled={eventoAtual === 0}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded"
            >
              ← anterior
            </button>
            <button
              onClick={() =>
                setEventoAtual((n) => Math.min(resultado.frames.length - 1, n + 1))
              }
              disabled={eventoAtual === resultado.frames.length - 1}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded"
            >
              próximo →
            </button>
          </div>
        </div>
      )}

      {/* Seções educativas */}
      <SobreEstrutura textoEd={projeto.textoEd} disciplinas={projeto.disciplinas} />
    </main>
  );
}
