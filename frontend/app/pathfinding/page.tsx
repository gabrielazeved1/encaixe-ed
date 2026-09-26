import { PathfindingVisualizer } from "@/components/ui/PathfindingVisualizer";

export default function PathfindingPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-white">
          Pathfinding Visualizer
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Desenhe paredes, mova o início e o fim, escolha o algoritmo e veja a
          busca acontecendo célula a célula. BFS e A* garantem o caminho mínimo.
          DFS vai fundo e mostra por que profundidade não é suficiente.
        </p>
      </header>

      <PathfindingVisualizer />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {[
          {
            algo: "BFS",
            cor: "blue",
            titulo: "Busca em Largura",
            texto:
              "Explora camada por camada, garantindo o menor número de passos. Cada nova célula visitada é exatamente um passo mais longe que a anterior. Mesma lógica usada no projeto Graus de Separação.",
          },
          {
            algo: "DFS",
            cor: "purple",
            titulo: "Busca em Profundidade",
            texto:
              "Vai o mais fundo possível antes de voltar. Encontra um caminho, mas raramente o mais curto. Útil para explorar labirintos e detectar ciclos em grafos.",
          },
          {
            algo: "A*",
            cor: "cyan",
            titulo: "A* (A-estrela)",
            texto:
              "Usa uma heurística (distância de Manhattan) para priorizar células que parecem mais próximas do destino. Visita menos células que BFS e ainda garante o caminho mínimo.",
          },
        ].map((item) => (
          <div
            key={item.algo}
            className="rounded-lg border border-slate-800 bg-[#161b27] p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-white">
                {item.algo}
              </span>
              <span className="text-xs text-slate-500">{item.titulo}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{item.texto}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
