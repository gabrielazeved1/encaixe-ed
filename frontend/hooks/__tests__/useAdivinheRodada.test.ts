import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAdivinheRodada } from "@/hooks/useAdivinheRodada";

function perguntaCompleta(camada: string, indice_correto: number) {
  return {
    camada,
    enunciado: `Pergunta de ${camada}`,
    alternativas: ["A", "B", "C", "D"],
    indice_correto,
    explicacao_acerto: "correto",
    explicacao_erro: "errado",
  };
}

function respostaRodada() {
  return {
    token: "tok.sig",
    passos: [
      { indice: 0, descricao: "p0", destaques: [], estado: {} },
      { indice: 1, descricao: "p1", destaques: [], estado: {} },
    ],
    pergunta_estrutura: {
      camada: "estrutura",
      enunciado: "Qual estrutura?",
      alternativas: ["A", "B", "C", "D"],
    },
    estrutura: "pilha",
    perguntas: [
      perguntaCompleta("estrutura", 0),
      perguntaCompleta("operacao", 1),
      perguntaCompleta("complexidade", 2),
    ],
  };
}

function mockarRespostas(respostas: unknown[]) {
  const fetchMock = vi.fn();
  for (const r of respostas) {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => r,
    });
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("useAdivinheRodada", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("carrega rodada e estado fica respondendo", async () => {
    mockarRespostas([respostaRodada()]);
    const { result } = renderHook(() => useAdivinheRodada(1));

    await waitFor(() => {
      expect(result.current.estado).toBe("respondendo");
    });
    expect(result.current.rodada).not.toBeNull();
    expect(result.current.respostas[0].selecionada).toBeNull();
    expect(result.current.pontuacao).toBeNull();
  });

  it("selecionar atualiza respostas sem verificar", async () => {
    mockarRespostas([respostaRodada()]);
    const { result } = renderHook(() => useAdivinheRodada(1));

    await waitFor(() => expect(result.current.estado).toBe("respondendo"));

    act(() => {
      result.current.selecionar(0, 2);
      result.current.selecionar(1, 0);
    });

    expect(result.current.respostas[0].selecionada).toBe(2);
    expect(result.current.respostas[1].selecionada).toBe(0);
    expect(result.current.respostas[0].acertou).toBeNull();
    expect(result.current.estado).toBe("respondendo");
  });

  it("verificar computa acertos e muda para estado verificado", async () => {
    mockarRespostas([respostaRodada()]);
    const { result } = renderHook(() => useAdivinheRodada(1));

    await waitFor(() => expect(result.current.estado).toBe("respondendo"));

    act(() => {
      result.current.selecionar(0, 0); // correto (indice_correto=0)
      result.current.selecionar(1, 3); // errado (indice_correto=1)
      result.current.selecionar(2, 2); // correto (indice_correto=2)
    });

    act(() => {
      result.current.verificar();
    });

    expect(result.current.estado).toBe("verificado");
    expect(result.current.pontuacao).toBe(2);
    expect(result.current.respostas[0].acertou).toBe(true);
    expect(result.current.respostas[1].acertou).toBe(false);
    expect(result.current.respostas[2].acertou).toBe(true);
  });

  it("verificar com resposta nula conta como errado", async () => {
    mockarRespostas([respostaRodada()]);
    const { result } = renderHook(() => useAdivinheRodada(1));

    await waitFor(() => expect(result.current.estado).toBe("respondendo"));

    act(() => {
      result.current.verificar();
    });

    expect(result.current.estado).toBe("verificado");
    expect(result.current.pontuacao).toBe(0);
    expect(result.current.respostas[0].acertou).toBe(false);
  });

  it("erro no fetch inicial transiciona para estado erro", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: "falha" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAdivinheRodada());

    await waitFor(() => expect(result.current.estado).toBe("erro"));
    expect(result.current.erro).toContain("falha");
  });

  it("proximaRodada reseta estado e carrega nova rodada", async () => {
    mockarRespostas([respostaRodada(), respostaRodada()]);
    const { result } = renderHook(() => useAdivinheRodada(1));

    await waitFor(() => expect(result.current.estado).toBe("respondendo"));

    act(() => {
      result.current.selecionar(0, 1);
    });

    await act(async () => {
      await result.current.proximaRodada();
    });

    expect(result.current.estado).toBe("respondendo");
    expect(result.current.respostas[0].selecionada).toBeNull();
    expect(result.current.pontuacao).toBeNull();
  });
});
