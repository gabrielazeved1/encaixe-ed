import { Disciplina } from "@/content/projetos";

type Props = {
  textoEd: string;
  disciplinas: Disciplina[];
};

export function SobreEstrutura({ textoEd, disciplinas }: Props) {
  return (
    <div className="mt-12 space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-gray-100 mb-3">
          Sobre esta estrutura
        </h2>
        <div className="text-gray-300 leading-relaxed whitespace-pre-line">
          {textoEd}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-100 mb-3">
          Onde isso aparece na faculdade
        </h2>
        <ul className="space-y-3">
          {disciplinas.map((d) => (
            <li key={d.nome} className="border border-gray-700 rounded-lg p-4">
              <p className="font-medium text-blue-300 mb-1">{d.nome}</p>
              <p className="text-gray-400 text-sm">{d.relacao}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
