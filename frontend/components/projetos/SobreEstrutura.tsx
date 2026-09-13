import { Disciplina } from "@/content/projetos";

type Props = {
  textoEd: string;
  disciplinas: Disciplina[];
  operacoes?: string[];
  complexidade?: string;
};

export function SobreEstrutura({
  textoEd,
  disciplinas,
  operacoes,
  complexidade,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6 space-y-6">
      <h2 className="text-base font-semibold text-white">
        Sobre esta estrutura
      </h2>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          O que é?
        </h3>
        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
          {textoEd}
        </div>
      </section>

      {operacoes && operacoes.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Operações principais
          </h3>
          <ul className="space-y-1">
            {operacoes.map((op) => (
              <li key={op} className="flex items-start gap-2 text-sm">
                <span className="text-blue-400 font-mono mt-0.5">›</span>
                <span className="text-slate-300 font-mono">{op}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {complexidade && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Complexidade
          </h3>
          <p className="text-sm text-slate-300 font-mono bg-[#0d1117] rounded-lg border border-slate-700 px-3 py-2">
            {complexidade}
          </p>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          Onde isso aparece na faculdade
        </h3>
        <ul className="space-y-3">
          {disciplinas.map((d) => (
            <li
              key={d.nome}
              className="rounded-lg border border-slate-700/60 bg-[#0d1117] p-3 space-y-1"
            >
              <p className="font-medium text-blue-400 text-sm">{d.nome}</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                {d.relacao}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
