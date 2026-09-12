import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-20 space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-100">
          Encaixe — Estruturas de Dados em Ação
        </h1>
        <p className="text-gray-300 leading-relaxed">
          Este site nasceu da leitura do livro &ldquo;Entendendo Estrutura de Dados&rdquo;
          e do fim de uma graduação em Engenharia de Computação — o momento em que as peças
          de anos de disciplinas separadas finalmente se encaixam. Cada projeto aqui é uma
          estrutura de dados clássica rodando de verdade, resolvendo um problema prático, e
          ligada à disciplina da faculdade onde ela reaparece disfarçada de outro nome.
        </p>
        <p className="text-gray-500 text-sm">
          Desenvolvido por{" "}
          <span className="text-gray-300">Gabriel Azevedo Santos Lopes</span>,
          formando em Engenharia de Computação pela UFU.
        </p>
      </header>

      <Link
        href="/projetos"
        className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
      >
        Ver os projetos →
      </Link>
    </main>
  );
}
