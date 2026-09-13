"use client";

import { useMemo, useState } from "react";
import { useGrausSeparacao } from "@/hooks/useGrausSeparacao";
import { GrausSeparacaoVisual } from "@/components/projetos/GrausSeparacaoVisual";
import { EmptyStateGrafo } from "@/components/projetos/RoteamentoDemo";
import { Pessoa, Amizade } from "@/lib/api";

const PESSOAS_PADRAO: Pessoa[] = [
  { id: "ana", nome: "Ana" },
  { id: "bruno", nome: "Bruno" },
  { id: "carla", nome: "Carla" },
  { id: "diego", nome: "Diego" },
  { id: "elisa", nome: "Elisa" },
  { id: "fabio", nome: "Fábio" },
];

const AMIZADES_PADRAO: Amizade[] = [
  { a: "ana", b: "bruno" },
  { a: "ana", b: "carla" },
  { a: "bruno", b: "diego" },
  { a: "carla", b: "diego" },
  { a: "carla", b: "elisa" },
  { a: "diego", b: "fabio" },
  { a: "elisa", b: "fabio" },
  { a: "bruno", b: "elisa" },
];

export function GrausSeparacaoDemo() {
  const [pessoas] = useState<Pessoa[]>(PESSOAS_PADRAO);
  const [amizades] = useState<Amizade[]>(AMIZADES_PADRAO);
  const [origem, setOrigem] = useState<string>("ana");
  const [destino, setDestino] = useState<string>("fabio");

  const { resultado, loading, erro, simular } = useGrausSeparacao();

  const opcoes = useMemo(
    () =>
      pessoas.map((p) => (
        <option key={p.id} value={p.id}>
          {p.nome}
        </option>
      )),
    [pessoas]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await simular(pessoas, amizades, origem, destino);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6">
      <h2 className="text-base font-semibold text-white mb-5">
        Demonstração interativa
      </h2>

      <p className="text-sm text-slate-400 mb-4">
        Rede pré-definida com {pessoas.length} pessoas e {amizades.length}{" "}
        amizades.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap items-end mb-6">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Origem
          </label>
          <select
            value={origem}
            onChange={(e) => setOrigem(e.target.value)}
            className="bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {opcoes}
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Destino
          </label>
          <select
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            className="bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {opcoes}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
        >
          {loading ? "Buscando…" : "Encontrar caminho"}
        </button>
      </form>

      {erro && <p className="text-red-400 text-sm mb-4">{erro}</p>}

      {resultado ? (
        <GrausSeparacaoVisual
          caminho={resultado.caminho}
          graus={resultado.graus}
          niveis={resultado.niveis}
          nomesCaminho={resultado.nomes_caminho}
        />
      ) : (
        <EmptyStateGrafo cor="indigo" />
      )}
    </div>
  );
}
