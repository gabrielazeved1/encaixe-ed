import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { BuscaHashVisual } from "@/components/projetos/BuscaHashVisual";
import type { BuscaHashResult } from "@/lib/api";
import type { PassoHash } from "@/types/passos";

const bucketsVazios = () =>
  Array.from({ length: 16 }, () => [] as [string, unknown][]);

const PASSOS: PassoHash[] = [
  {
    indice: 0,
    descricao: "Tabela vazia (16 buckets). Pronta para receber inserções.",
    destaques: [],
    estado: { tamanho: 16, buckets: bucketsVazios() },
  },
  {
    indice: 1,
    descricao: 'Inserindo "a" → h("a") = 1. Bucket 1 está vazio.',
    destaques: ["bucket:1"],
    estado: {
      tamanho: 16,
      buckets: bucketsVazios().map((b, i) =>
        i === 1 ? ([["a", 1]] as [string, unknown][]) : b
      ),
    },
  },
  {
    indice: 2,
    descricao:
      'Inserindo "q" → h("q") = 1. Colisão: bucket 1 já tem "a". Adicionando ao final da lista.',
    destaques: ["bucket:1"],
    estado: {
      tamanho: 16,
      buckets: bucketsVazios().map((b, i) =>
        i === 1
          ? ([
              ["a", 1],
              ["q", 2],
            ] as [string, unknown][])
          : b
      ),
    },
  },
];

const RESUMO: BuscaHashResult = {
  linear: { comparacoes: 2, encontrado: true },
  hash: { comparacoes: 2, encontrado: true, indice: 1 },
  passos: PASSOS,
};

describe("BuscaHashVisual", () => {
  it("renderiza o passo inicial com descrição de tabela vazia", () => {
    render(<BuscaHashVisual passos={PASSOS} resumo={RESUMO} chave="q" />);

    expect(screen.getByText(/passo 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Tabela vazia/i)).toBeInTheDocument();
  });

  it("ao avançar até a colisão o bucket colidido fica destacado", async () => {
    const user = userEvent.setup();
    render(<BuscaHashVisual passos={PASSOS} resumo={RESUMO} chave="q" />);

    await user.click(screen.getByRole("button", { name: /próximo/i }));
    await user.click(screen.getByRole("button", { name: /próximo/i }));

    expect(screen.getByText(/passo 3 de 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Colisão/i)).toBeInTheDocument();
    expect(document.querySelector('[data-destaque="bucket:1"]')).not.toBeNull();
  });

  it("mantém o resumo de comparação linear vs hash visível", () => {
    render(<BuscaHashVisual passos={PASSOS} resumo={RESUMO} chave="q" />);

    expect(screen.getByText(/Busca Linear/i)).toBeInTheDocument();
    expect(screen.getByText(/Hash Table/i)).toBeInTheDocument();
  });
});
