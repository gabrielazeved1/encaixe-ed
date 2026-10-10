import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAtalhosRodada } from "@/hooks/useAtalhosRodada";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useAtalhosRodada", () => {
  it("teclas 1-4 chamam onNumero com indice correto", () => {
    const onNumero = vi.fn();
    renderHook(() => useAtalhosRodada({ onNumero }));

    fireEvent.keyDown(document, { key: "1" });
    fireEvent.keyDown(document, { key: "2" });
    fireEvent.keyDown(document, { key: "3" });
    fireEvent.keyDown(document, { key: "4" });

    expect(onNumero).toHaveBeenCalledTimes(4);
    expect(onNumero).toHaveBeenNthCalledWith(1, 0);
    expect(onNumero).toHaveBeenNthCalledWith(2, 1);
    expect(onNumero).toHaveBeenNthCalledWith(3, 2);
    expect(onNumero).toHaveBeenNthCalledWith(4, 3);
  });

  it("Enter chama onConfirmar", () => {
    const onConfirmar = vi.fn();
    renderHook(() => useAtalhosRodada({ onConfirmar }));
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onConfirmar).toHaveBeenCalledOnce();
  });

  it("ArrowLeft chama onEsquerda", () => {
    const onEsquerda = vi.fn();
    renderHook(() => useAtalhosRodada({ onEsquerda }));
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(onEsquerda).toHaveBeenCalledOnce();
  });

  it("ArrowRight e Space chamam onDireita", () => {
    const onDireita = vi.fn();
    renderHook(() => useAtalhosRodada({ onDireita }));
    fireEvent.keyDown(document, { key: "ArrowRight" });
    fireEvent.keyDown(document, { key: " " });
    expect(onDireita).toHaveBeenCalledTimes(2);
  });

  it("foco em input ignora atalhos", () => {
    const onNumero = vi.fn();
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    renderHook(() => useAtalhosRodada({ onNumero }));
    fireEvent.keyDown(document, { key: "1" });

    expect(onNumero).not.toHaveBeenCalled();
  });

  it("foco em textarea ignora atalhos", () => {
    const onConfirmar = vi.fn();
    const ta = document.createElement("textarea");
    document.body.appendChild(ta);
    ta.focus();

    renderHook(() => useAtalhosRodada({ onConfirmar }));
    fireEvent.keyDown(document, { key: "Enter" });

    expect(onConfirmar).not.toHaveBeenCalled();
  });
});
