import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PerguntaAcademica } from "@/components/jogo/PerguntaAcademica";
import type { PerguntaRevelada } from "@/lib/api";

const perguntaFixa: PerguntaRevelada = {
  camada: "estrutura",
  enunciado: "Qual estrutura mantém ordem parcial e extrai mínimo?",
  alternativas: ["Alt A", "Alt B", "Alt C", "Alt D"],
};

describe("PerguntaAcademica", () => {
  it("renderiza enunciado e as 4 alternativas", () => {
    render(
      <PerguntaAcademica
        pergunta={perguntaFixa}
        selecionada={null}
        onSelecionar={() => {}}
        onConfirmar={() => {}}
        desabilitado={false}
      />
    );
    expect(screen.getByText(perguntaFixa.enunciado)).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("Alt B")).toBeInTheDocument();
  });

  it("clicar numa alternativa chama onSelecionar com indice", () => {
    const onSelecionar = vi.fn();
    render(
      <PerguntaAcademica
        pergunta={perguntaFixa}
        selecionada={null}
        onSelecionar={onSelecionar}
        onConfirmar={() => {}}
        desabilitado={false}
      />
    );
    fireEvent.click(screen.getByText("Alt B"));
    expect(onSelecionar).toHaveBeenCalledWith(1);
  });

  it("botao Confirmar desabilitado quando selecionada e null", () => {
    render(
      <PerguntaAcademica
        pergunta={perguntaFixa}
        selecionada={null}
        onSelecionar={() => {}}
        onConfirmar={() => {}}
        desabilitado={false}
      />
    );
    const btn = screen.getByRole("button", { name: "Confirmar" });
    expect(btn).toBeDisabled();
  });

  it("botao Confirmar habilitado quando selecionada e indice valido", () => {
    render(
      <PerguntaAcademica
        pergunta={perguntaFixa}
        selecionada={2}
        onSelecionar={() => {}}
        onConfirmar={() => {}}
        desabilitado={false}
      />
    );
    const btn = screen.getByRole("button", { name: "Confirmar" });
    expect(btn).not.toBeDisabled();
  });

  it("clicar em Confirmar chama onConfirmar", () => {
    const onConfirmar = vi.fn();
    render(
      <PerguntaAcademica
        pergunta={perguntaFixa}
        selecionada={0}
        onSelecionar={() => {}}
        onConfirmar={onConfirmar}
        desabilitado={false}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onConfirmar).toHaveBeenCalledOnce();
  });
});
