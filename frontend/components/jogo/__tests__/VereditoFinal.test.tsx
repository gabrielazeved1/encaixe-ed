import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VereditoFinal } from "@/components/jogo/VereditoFinal";
import type { VereditoParcial } from "@/lib/api";

function v(
  camada: VereditoParcial["camada"],
  acertou: boolean,
  correto: string
): VereditoParcial {
  return {
    camada,
    acertou,
    correto,
    explicacao: `explicação de ${camada}`,
    proxima_pergunta: null,
  };
}

const vereditosFixos: [VereditoParcial, VereditoParcial, VereditoParcial] = [
  v("estrutura", true, "Pilha (LIFO)"),
  v("operacao", false, "push"),
  v("complexidade", true, "O(1)"),
];

describe("VereditoFinal", () => {
  it("renderiza 3 cards com rotulos de cada camada", () => {
    render(
      <VereditoFinal
        vereditos={vereditosFixos}
        pontuacao={2}
        onProxima={() => {}}
      />
    );
    expect(screen.getByText("Estrutura")).toBeInTheDocument();
    expect(screen.getByText("Operação")).toBeInTheDocument();
    expect(screen.getByText("Complexidade")).toBeInTheDocument();
  });

  it("mostra respostas corretas destacadas", () => {
    render(
      <VereditoFinal
        vereditos={vereditosFixos}
        pontuacao={2}
        onProxima={() => {}}
      />
    );
    expect(screen.getByText("Pilha (LIFO)")).toBeInTheDocument();
    expect(screen.getByText("push")).toBeInTheDocument();
    expect(screen.getByText("O(1)")).toBeInTheDocument();
  });

  it("renderiza as 3 explicacoes", () => {
    render(
      <VereditoFinal
        vereditos={vereditosFixos}
        pontuacao={2}
        onProxima={() => {}}
      />
    );
    expect(screen.getByText("explicação de estrutura")).toBeInTheDocument();
    expect(screen.getByText("explicação de operacao")).toBeInTheDocument();
    expect(screen.getByText("explicação de complexidade")).toBeInTheDocument();
  });

  it("pontuacao 3 renderiza aria-label '3 de 3 acertos'", () => {
    render(
      <VereditoFinal
        vereditos={[
          v("estrutura", true, "x"),
          v("operacao", true, "y"),
          v("complexidade", true, "z"),
        ]}
        pontuacao={3}
        onProxima={() => {}}
      />
    );
    expect(screen.getByLabelText("3 de 3 acertos")).toBeInTheDocument();
  });

  it("pontuacao 0 renderiza aria-label '0 de 3 acertos'", () => {
    render(
      <VereditoFinal
        vereditos={[
          v("estrutura", false, "x"),
          v("operacao", false, "y"),
          v("complexidade", false, "z"),
        ]}
        pontuacao={0}
        onProxima={() => {}}
      />
    );
    expect(screen.getByLabelText("0 de 3 acertos")).toBeInTheDocument();
  });

  it("botao Proxima rodada chama onProxima", () => {
    const onProxima = vi.fn();
    render(
      <VereditoFinal
        vereditos={vereditosFixos}
        pontuacao={2}
        onProxima={onProxima}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /próxima rodada/i }));
    expect(onProxima).toHaveBeenCalledOnce();
  });

  it("cards acertou têm classe emerald e cards errou têm classe amber", () => {
    const { container } = render(
      <VereditoFinal
        vereditos={vereditosFixos}
        pontuacao={2}
        onProxima={() => {}}
      />
    );
    const cards = container.querySelectorAll(".veredito-card");
    expect(cards).toHaveLength(3);
    expect(cards[0].className).toContain("emerald");
    expect(cards[1].className).toContain("amber");
    expect(cards[2].className).toContain("emerald");
  });
});
