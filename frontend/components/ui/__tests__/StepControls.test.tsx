import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StepControls } from "@/components/ui/StepControls";

function propsBase() {
  return {
    indice: 0,
    totalPassos: 3,
    podeAvancar: true,
    podeVoltar: false,
    onAvancar: vi.fn(),
    onVoltar: vi.fn(),
    onResetar: vi.fn(),
  };
}

function propsAutoplay(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ...propsBase(),
    tocando: false,
    velocidade: 1,
    onTocar: vi.fn(),
    onPausar: vi.fn(),
    onMudarVelocidade: vi.fn(),
    ...overrides,
  };
}

describe("StepControls — modo manual", () => {
  it("não renderiza controles de autoplay quando props não são passadas", () => {
    render(<StepControls {...propsBase()} />);
    expect(screen.queryByRole("button", { name: /tocar|pausar/i })).toBeNull();
    expect(screen.queryByRole("group", { name: /velocidade/i })).toBeNull();
  });
});

describe("StepControls — autoplay (US2)", () => {
  it("mostra 'Tocar' quando tocando=false e dispara onTocar", async () => {
    const user = userEvent.setup();
    const props = propsAutoplay();
    render(<StepControls {...props} />);

    const btn = screen.getByRole("button", { name: /tocar/i });
    expect(btn).toHaveTextContent(/Tocar/i);

    await user.click(btn);
    expect(props.onTocar).toHaveBeenCalledTimes(1);
    expect(props.onPausar).not.toHaveBeenCalled();
  });

  it("mostra 'Pausar' quando tocando=true e dispara onPausar", async () => {
    const user = userEvent.setup();
    const props = propsAutoplay({ tocando: true });
    render(<StepControls {...props} />);

    const btn = screen.getByRole("button", { name: /pausar/i });
    expect(btn).toHaveTextContent(/Pausar/i);

    await user.click(btn);
    expect(props.onPausar).toHaveBeenCalledTimes(1);
    expect(props.onTocar).not.toHaveBeenCalled();
  });

  it("clicar numa velocidade dispara onMudarVelocidade com o valor correto", async () => {
    const user = userEvent.setup();
    const props = propsAutoplay();
    render(<StepControls {...props} />);

    await user.click(screen.getByRole("button", { name: "2×" }));
    expect(props.onMudarVelocidade).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole("button", { name: "0.5×" }));
    expect(props.onMudarVelocidade).toHaveBeenCalledWith(0.5);
  });

  it("velocidade ativa é marcada com aria-pressed=true", () => {
    render(<StepControls {...propsAutoplay({ velocidade: 2 })} />);

    expect(screen.getByRole("button", { name: "2×" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "1×" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("botão Tocar fica desabilitado no último passo quando não tocando", () => {
    render(
      <StepControls
        {...propsAutoplay({
          indice: 2,
          totalPassos: 3,
          podeAvancar: false,
          podeVoltar: true,
        })}
      />
    );

    expect(screen.getByRole("button", { name: /tocar/i })).toBeDisabled();
  });
});
