import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { IndiceBSTVisual } from "@/components/projetos/IndiceBSTVisual";
import type { PassoBst } from "@/types/passos";

const PASSOS: PassoBst[] = [
  {
    indice: 0,
    descricao: "Árvore vazia. Inserindo 50 como raiz.",
    destaques: ["no:50"],
    estado: { valor: 50, esq: null, dir: null },
  },
  {
    indice: 1,
    descricao:
      "Inserindo 30. Comparando com raiz 50 → 30 < 50, desce para a esquerda.",
    destaques: ["no:50"],
    estado: { valor: 50, esq: null, dir: null },
  },
  {
    indice: 2,
    descricao: "Posição vazia à esquerda de 50. Inserindo 30 ali.",
    destaques: ["no:30"],
    estado: {
      valor: 50,
      esq: { valor: 30, esq: null, dir: null },
      dir: null,
    },
  },
];

describe("IndiceBSTVisual", () => {
  it("renderiza o primeiro passo com destaque na raiz", () => {
    render(<IndiceBSTVisual passos={PASSOS} />);

    expect(screen.getByText(/passo 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Inserindo 50 como raiz/i)).toBeInTheDocument();
    expect(document.querySelector('[data-destaque="no:50"]')).not.toBeNull();
  });

  it("ao avançar mostra passo da comparação e segue destacando raiz", async () => {
    const user = userEvent.setup();
    render(<IndiceBSTVisual passos={PASSOS} />);

    await user.click(screen.getByRole("button", { name: /próximo/i }));

    expect(screen.getByText(/passo 2 de 3/i)).toBeInTheDocument();
    expect(screen.getByText(/desce para a esquerda/i)).toBeInTheDocument();
    expect(document.querySelector('[data-destaque="no:50"]')).not.toBeNull();
  });

  it("no último passo o destaque muda para o nó recém-inserido", async () => {
    const user = userEvent.setup();
    render(<IndiceBSTVisual passos={PASSOS} />);

    await user.click(screen.getByRole("button", { name: /próximo/i }));
    await user.click(screen.getByRole("button", { name: /próximo/i }));

    expect(screen.getByText(/passo 3 de 3/i)).toBeInTheDocument();
    expect(document.querySelector('[data-destaque="no:30"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: /próximo/i })).toBeDisabled();
  });
});
