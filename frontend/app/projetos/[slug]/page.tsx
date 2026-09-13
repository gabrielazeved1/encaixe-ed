"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getProjetoBySlug, COR_CLASSES } from "@/content/projetos";
import { PilhaDemo } from "@/components/projetos/PilhaDemo";
import { EscalonadorDemo } from "@/components/projetos/EscalonadorDemo";
import { RoteamentoDemo } from "@/components/projetos/RoteamentoDemo";
import { GrausSeparacaoDemo } from "@/components/projetos/GrausSeparacaoDemo";
import { BuscaHashDemo } from "@/components/projetos/BuscaHashDemo";
import { IndiceBSTDemo } from "@/components/projetos/IndiceBSTDemo";
import { AlocadorMemoriaDemo } from "@/components/projetos/AlocadorMemoriaDemo";
import { SobreEstrutura } from "@/components/projetos/SobreEstrutura";

const DEMOS: Record<string, () => JSX.Element> = {
  pilha: PilhaDemo,
  escalonador: EscalonadorDemo,
  roteamento: RoteamentoDemo,
  "graus-de-separacao": GrausSeparacaoDemo,
  "busca-hash": BuscaHashDemo,
  "indice-bst": IndiceBSTDemo,
  "alocador-memoria": AlocadorMemoriaDemo,
};

const BULLETS: Record<string, string[]> = {
  pilha: [
    "Pilha crescendo e diminuindo em tempo real",
    "Cada frame com nome da função e argumento",
    "Stack overflow quando a profundidade estourar",
    "Navegação evento a evento pelo histórico",
  ],
  escalonador: [
    "Diagrama de Gantt com fatias de tempo por processo",
    "Round-Robin distribuindo o quantum em ordem FIFO",
    "Prioridade extraindo sempre o processo mais urgente",
    "Comparação direta entre justiça e urgência",
  ],
  roteamento: [
    "Rota de menor custo entre dois nós",
    "Passos de Dijkstra na ordem de visitação",
    "Custo acumulado a cada nó explorado",
    "Nós predecessores reconstruindo o caminho",
  ],
  "graus-de-separacao": [
    "Menor número de amizades entre duas pessoas",
    "Camadas BFS explorando por distância",
    "Caminho mínimo em grafo não ponderado",
    "Nomes reais em vez de IDs no caminho",
  ],
  "busca-hash": [
    "Número de comparações em cada abordagem",
    "Índice calculado pela função hash",
    "Comparativo visual lado a lado",
    "Quantas vezes hash foi mais rápido",
  ],
  "indice-bst": [
    "Comparações da BST vs. varredura linear",
    "Sequência de decisões esquerda/direita",
    "Detecção do valor encontrado ou não",
    "Reforço visual do ganho O(log n)",
  ],
  "alocador-memoria": [
    "Barra de memória de 512B em tempo real",
    "Blocos livres em verde, usados em vermelho",
    "Coalescing unindo blocos livres adjacentes",
    "Índice de fragmentação subindo com o uso",
  ],
};

function ProjetoIcone({ cor }: { cor: keyof typeof COR_CLASSES }) {
  const classes = COR_CLASSES[cor];
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${classes.bg} ${classes.text}`}
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </span>
  );
}

export default function ProjetoPage() {
  const { slug } = useParams<{ slug: string }>();
  const projeto = getProjetoBySlug(slug);

  if (!projeto) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">
        Projeto não encontrado.
      </main>
    );
  }

  const corClasses = COR_CLASSES[projeto.cor];
  const Demo = DEMOS[projeto.slug];
  const bullets = BULLETS[projeto.slug] ?? [];

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <Link
        href="/projetos"
        className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors mb-8"
      >
        <span aria-hidden="true">←</span>
        Voltar para projetos
      </Link>

      <header className="mb-10 space-y-3">
        <div className="flex items-center gap-3">
          <ProjetoIcone cor={projeto.cor} />
          <div>
            <p
              className={`text-xs font-semibold tracking-wider uppercase ${corClasses.text}`}
            >
              {projeto.ed}
            </p>
            <h1 className="text-2xl font-bold text-white">{projeto.nome}</h1>
          </div>
        </div>
        <p className="text-slate-400">{projeto.descricao}</p>
        <div className="flex flex-wrap gap-2">
          {projeto.disciplinas.map((d) => (
            <span
              key={d.nome}
              className={`text-xs px-2.5 py-1 rounded-full ${corClasses.bg} ${corClasses.text} ${corClasses.border} border`}
            >
              {d.nome}
            </span>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {Demo ? (
            <Demo />
          ) : (
            <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6 text-slate-400">
              Demonstração indisponível.
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {bullets.length > 0 && (
            <div className="rounded-xl border border-slate-700 bg-[#161b27] p-6 space-y-3">
              <h2 className="text-base font-semibold text-white">
                O que você vai ver aqui
              </h2>
              <ul className="space-y-2">
                {bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <span className="text-green-400 mt-0.5">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <SobreEstrutura
            textoEd={projeto.textoEd}
            disciplinas={projeto.disciplinas}
            operacoes={projeto.operacoes}
            complexidade={projeto.complexidade}
          />
        </div>
      </div>
    </main>
  );
}
