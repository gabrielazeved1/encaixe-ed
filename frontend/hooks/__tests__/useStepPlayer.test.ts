import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useStepPlayer } from "@/hooks/useStepPlayer";
import type { Passo } from "@/types/passos";

type EstadoFake = { v: number };

function fazerPassos(n: number): Passo<EstadoFake>[] {
  return Array.from({ length: n }, (_, i) => ({
    indice: i,
    descricao: `passo ${i}`,
    destaques: [],
    estado: { v: i },
  }));
}

describe("useStepPlayer", () => {
  it("inicia em indice 0 com o primeiro passo", () => {
    const passos = fazerPassos(3);
    const { result } = renderHook(() => useStepPlayer(passos));

    expect(result.current.indice).toBe(0);
    expect(result.current.totalPassos).toBe(3);
    expect(result.current.passoAtual?.descricao).toBe("passo 0");
    expect(result.current.podeVoltar).toBe(false);
    expect(result.current.podeAvancar).toBe(true);
  });

  it("avancar incrementa ate o fim e para", () => {
    const passos = fazerPassos(3);
    const { result } = renderHook(() => useStepPlayer(passos));

    act(() => result.current.avancar());
    expect(result.current.indice).toBe(1);

    act(() => result.current.avancar());
    expect(result.current.indice).toBe(2);
    expect(result.current.podeAvancar).toBe(false);

    act(() => result.current.avancar());
    expect(result.current.indice).toBe(2);
  });

  it("voltar decrementa ate 0 e para", () => {
    const passos = fazerPassos(3);
    const { result } = renderHook(() => useStepPlayer(passos));

    act(() => result.current.avancar());
    act(() => result.current.avancar());
    expect(result.current.indice).toBe(2);

    act(() => result.current.voltar());
    expect(result.current.indice).toBe(1);

    act(() => result.current.voltar());
    expect(result.current.indice).toBe(0);
    expect(result.current.podeVoltar).toBe(false);

    act(() => result.current.voltar());
    expect(result.current.indice).toBe(0);
  });

  it("resetar volta para o inicio", () => {
    const passos = fazerPassos(3);
    const { result } = renderHook(() => useStepPlayer(passos));

    act(() => result.current.avancar());
    act(() => result.current.avancar());
    expect(result.current.indice).toBe(2);

    act(() => result.current.resetar());
    expect(result.current.indice).toBe(0);
  });

  it("troca de passos reseta indice (FR-010)", () => {
    const passosA = fazerPassos(3);
    const passosB = fazerPassos(5);
    const { result, rerender } = renderHook(
      ({ passos }: { passos: Passo<EstadoFake>[] }) => useStepPlayer(passos),
      { initialProps: { passos: passosA } }
    );

    act(() => result.current.avancar());
    act(() => result.current.avancar());
    expect(result.current.indice).toBe(2);

    rerender({ passos: passosB });

    expect(result.current.indice).toBe(0);
    expect(result.current.totalPassos).toBe(5);
  });

  it("lista vazia retorna passoAtual null", () => {
    const { result } = renderHook(() => useStepPlayer<EstadoFake>([]));

    expect(result.current.passoAtual).toBe(null);
    expect(result.current.totalPassos).toBe(0);
    expect(result.current.podeAvancar).toBe(false);
    expect(result.current.podeVoltar).toBe(false);
  });
});
