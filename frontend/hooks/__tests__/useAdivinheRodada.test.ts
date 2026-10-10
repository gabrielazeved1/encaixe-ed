import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAdivinheRodada } from "@/hooks/useAdivinheRodada";
import type { PerguntaRevelada, VereditoParcial } from "@/lib/api";

const perguntaEstrutura: PerguntaRevelada = {
  camada: "estrutura",
  enunciado: "Qual estrutura?",
  alternativas: ["A", "B", "C", "D"],
};
const perguntaOperacao: PerguntaRevelada = {
  camada: "operacao",
  enunciado: "Qual operação?",
  alternativas: ["op1", "op2", "op3", "op4"],
};
const perguntaComplexidade: PerguntaRevelada = {
  camada: "complexidade",
  enunciado: "Qual complexidade?",
  alternativas: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
};

function respostaRodada() {
  return {
    token: "tok.sig",
    passos: [
      { indice: 0, descricao: "p0", destaques: [], estado: {} },
      { indice: 1, descricao: "p1", destaques: [], estado: {} },
    ],
    pergunta_estrutura: perguntaEstrutura,
  };
}

function veredito(
  camada: VereditoParcial["camada"],
  acertou: boolean,
  proxima: PerguntaRevelada | null
): VereditoParcial {
  return {
    camada,
    acertou,
    correto: "A",
    explicacao: "exp",
    proxima_pergunta: proxima,
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

  it("carrega rodada e popula pergunta de estrutura", async () => {
    mockarRespostas([respostaRodada()]);
    const { result } = renderHook(() => useAdivinheRodada(1));

    await waitFor(() => {
      expect(result.current.estado).toBe("respondendo");
    });
    expect(result.current.perguntaAtual?.camada).toBe("estrutura");
    expect(result.current.vereditosParciais).toEqual([]);
  });

  it("enviar palpite avança para próxima pergunta", async () => {
    mockarRespostas([
      respostaRodada(),
      veredito("estrutura", true, perguntaOperacao),
    ]);
    const { result } = renderHook(() => useAdivinheRodada(1));

    await waitFor(() => {
      expect(result.current.estado).toBe("respondendo");
    });

    await act(async () => {
      await result.current.enviarPalpite("A");
    });

    expect(result.current.perguntaAtual?.camada).toBe("operacao");
    expect(result.current.vereditosParciais).toHaveLength(1);
    expect(result.current.estado).toBe("respondendo");
  });

  it("após 3 palpites transiciona para veredito com pontuação correta", async () => {
    mockarRespostas([
      respostaRodada(),
      veredito("estrutura", true, perguntaOperacao),
      veredito("operacao", false, perguntaComplexidade),
      veredito("complexidade", true, null),
    ]);
    const { result } = renderHook(() => useAdivinheRodada(1));

    await waitFor(() => expect(result.current.estado).toBe("respondendo"));
    await act(async () => {
      await result.current.enviarPalpite("A");
    });
    await act(async () => {
      await result.current.enviarPalpite("op2");
    });
    await act(async () => {
      await result.current.enviarPalpite("O(1)");
    });

    expect(result.current.estado).toBe("veredito");
    expect(result.current.pontuacao).toBe(2);
    expect(result.current.vereditosParciais).toHaveLength(3);
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

    await act(async () => {
      await result.current.proximaRodada();
    });

    expect(result.current.estado).toBe("respondendo");
    expect(result.current.vereditosParciais).toEqual([]);
    expect(result.current.pontuacao).toBeNull();
  });
});
