export type Frame = {
  nome_funcao: string;
  argumento: number;
  retorno: number | null;
  profundidade: number;
};

export type Evento = {
  tipo: "push" | "pop" | "overflow";
  frame: Frame;
  pilha_estado: Frame[];
};

export type SimulacaoResult = {
  funcao: string;
  valor: number;
  status: "completo" | "overflow";
  frames: Evento[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { erro?: string }).erro ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function pilhaSimular(
  funcao: string,
  valor: number
): Promise<SimulacaoResult> {
  return apiFetch<SimulacaoResult>("/api/pilha/simular/", { funcao, valor });
}
