import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PilhaVisual } from "@/components/projetos/PilhaVisual";
import type { PassoPilha } from "@/types/passos";

const PASSOS: PassoPilha[] = [
  {
    indice: 0,
    descricao: "Chamando fatorial(2). Empurrando frame na pilha.",
    destaques: ["frame:2"],
    estado: [
      { nome_funcao: "fatorial", argumento: 2, retorno: null, profundidade: 1 },
    ],
  },
  {
    indice: 1,
    descricao: "Chamando fatorial(1) recursivamente. Empurrando frame na pilha.",
    destaques: ["frame:1"],
    estado: [
      { nome_funcao: "fatorial", argumento: 2, retorno: null, profundidade: 1 },
      { nome_funcao: "fatorial", argumento: 1, retorno: null, profundidade: 2 },
    ],
  },
];

describe("PilhaVisual", () => {
  it("renderiza o primeiro passo e sua descricao", () => {
    render(<PilhaVisual passos={PASSOS} />);

    expect(screen.getByText(/passo 1 de 2/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Chamando fatorial\(2\)\. Empurrando frame/i)
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-destaque="frame:2"]')
    ).not.toBeNull();
  });

  it("avanca para o proximo passo ao clicar Proximo", async () => {
    const user = userEvent.setup();
    render(<PilhaVisual passos={PASSOS} />);

    await user.click(screen.getByRole("button", { name: /próximo/i }));

    expect(screen.getByText(/passo 2 de 2/i)).toBeInTheDocument();
    expect(screen.getByText(/recursivamente/i)).toBeInTheDocument();
    expect(
      document.querySelector('[data-destaque="frame:1"]')
    ).not.toBeNull();
  });

  it("botao proximo fica desabilitado no ultimo passo", async () => {
    const user = userEvent.setup();
    render(<PilhaVisual passos={PASSOS} />);

    await user.click(screen.getByRole("button", { name: /próximo/i }));

    expect(screen.getByRole("button", { name: /próximo/i })).toBeDisabled();
  });

  it("volta para o passo anterior ao clicar Anterior", async () => {
    const user = userEvent.setup();
    render(<PilhaVisual passos={PASSOS} />);

    await user.click(screen.getByRole("button", { name: /próximo/i }));
    await user.click(screen.getByRole("button", { name: /anterior/i }));

    expect(screen.getByText(/passo 1 de 2/i)).toBeInTheDocument();
  });
});
