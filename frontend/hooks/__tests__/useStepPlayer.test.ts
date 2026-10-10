import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

  describe("autoplay (US2)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("tocar faz o indice avançar com o passar do tempo", () => {
      const passos = fazerPassos(4);
      const { result } = renderHook(() => useStepPlayer(passos));

      act(() => result.current.tocar());
      expect(result.current.tocando).toBe(true);

      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(result.current.indice).toBe(1);

      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(result.current.indice).toBe(2);
    });

    it("pausar interrompe a progressão", () => {
      const passos = fazerPassos(4);
      const { result } = renderHook(() => useStepPlayer(passos));

      act(() => result.current.tocar());
      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(result.current.indice).toBe(1);

      act(() => result.current.pausar());
      expect(result.current.tocando).toBe(false);

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.indice).toBe(1);
    });

    it("velocidade maior encurta o intervalo", () => {
      const passos = fazerPassos(4);
      const { result } = renderHook(() => useStepPlayer(passos));

      act(() => result.current.setVelocidade(2));
      act(() => result.current.tocar());

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(result.current.indice).toBe(1);
    });

    it("ao atingir o último passo em autoplay, tocando volta a false", () => {
      const passos = fazerPassos(2);
      const { result } = renderHook(() => useStepPlayer(passos));

      act(() => result.current.tocar());
      act(() => {
        vi.advanceTimersByTime(800);
      });

      expect(result.current.indice).toBe(1);
      expect(result.current.tocando).toBe(false);
    });
  });
});
