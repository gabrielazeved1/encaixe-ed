import Link from "next/link";
import { projetos } from "@/content/projetos";

export default function ProjetosPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-100 mb-8">Projetos</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {projetos.map((p) => (
          <Link
            key={p.slug}
            href={`/projetos/${p.slug}`}
            className="block border border-gray-700 rounded-lg p-5 hover:border-blue-500 transition-colors group"
          >
            <p className="text-blue-400 text-xs mb-1">{p.ed}</p>
            <h2 className="text-gray-100 font-semibold group-hover:text-blue-300 transition-colors">
              {p.nome}
            </h2>
            <p className="text-gray-500 text-sm mt-2">{p.descricao}</p>
            <ul className="mt-3 flex flex-wrap gap-1">
              {p.disciplinas.map((d) => (
                <li
                  key={d.nome}
                  className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded"
                >
                  {d.nome}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </main>
  );
}
