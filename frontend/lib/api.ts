import type { PassoPilha } from "@/types/passos";

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
  passos: PassoPilha[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type FetchOptions = {
  method?: string;
  body?: string;
};

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "POST",
    headers: { "Content-Type": "application/json" },
    body: options.body,
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
  return apiFetch<SimulacaoResult>("/api/pilha/simular/", {
    method: "POST",
    body: JSON.stringify({ funcao, valor }),
  });
}

export type Processo = {
  id: string;
  nome: string;
  duracao: number;
  prioridade?: number;
};
export type GanttItem = {
  processo_id: string;
  nome: string;
  inicio: number;
  fim: number;
};
export type EscalonadorResult = {
  algoritmo: string;
  quantum?: number;
  gantt: GanttItem[];
  tempo_total: number;
};

export async function escalonadorSimular(
  processos: Processo[],
  algoritmo: string,
  quantum?: number
): Promise<EscalonadorResult> {
  return apiFetch<EscalonadorResult>("/api/escalonador/simular/", {
    method: "POST",
    body: JSON.stringify({ processos, algoritmo, quantum }),
  });
}

export type ArestaRot = { origem: string; destino: string; custo: number };
export type PassoDijkstra = {
  no: string;
  custo_acumulado: number;
  via: string | null;
};
export type RoteamentoResult = {
  caminho: string[];
  custo_total: number;
  passos: PassoDijkstra[];
};

export async function roteamentoCalcular(
  nos: string[],
  arestas: ArestaRot[],
  origem: string,
  destino: string
): Promise<RoteamentoResult> {
  return apiFetch<RoteamentoResult>("/api/roteamento/calcular/", {
    method: "POST",
    body: JSON.stringify({ nos, arestas, origem, destino }),
  });
}

export type Pessoa = { id: string; nome: string };
export type Amizade = { a: string; b: string };
export type GrausResult = {
  caminho: string[];
  graus: number;
  niveis: { nivel: number; nos: string[] }[];
  nomes_caminho: string[];
};

export async function grausBFS(
  pessoas: Pessoa[],
  amizades: Amizade[],
  origem: string,
  destino: string
): Promise<GrausResult> {
  return apiFetch<GrausResult>("/api/graus/bfs/", {
    method: "POST",
    body: JSON.stringify({ pessoas, amizades, origem, destino }),
  });
}

export type EntradaHash = { chave: string; valor: string };
export type BuscaHashResult = {
  linear: { comparacoes: number; encontrado: boolean };
  hash: { comparacoes: number; encontrado: boolean; indice: number };
};

export async function hashComparar(
  chave: string,
  dados?: EntradaHash[]
): Promise<BuscaHashResult> {
  return apiFetch<BuscaHashResult>("/api/hash/comparar/", {
    method: "POST",
    body: JSON.stringify({ chave, dados }),
  });
}

export type NoBST = { valor: number; esq: NoBST | null; dir: NoBST | null };
export type PassoBST = { no: number; comparacao: "igual" | "menor" | "maior" };
export type BSTResult = {
  arvore: NoBST | null;
  passos: PassoBST[];
  encontrado: boolean;
  comparacoes_bst: number;
  comparacoes_linear: number;
};

export async function bstSimular(
  valores: number[],
  alvo: number
): Promise<BSTResult> {
  return apiFetch<BSTResult>("/api/bst/simular/", {
    method: "POST",
    body: JSON.stringify({ valores, alvo }),
  });
}

export type Operacao = {
  tipo: "alocar" | "liberar";
  tamanho?: number;
  bloco_id?: number;
};
export type BlocoMemoria = { id: number; tamanho: number; livre: boolean };
export type EstadoMemoria = {
  blocos: BlocoMemoria[];
  livre_total: number;
  usado_total: number;
  fragmentacao: number;
};
export type EstadoOperacao = EstadoMemoria & {
  operacao: Operacao;
  resultado: Record<string, unknown>;
};
export type AlocadorResult = {
  estados: EstadoOperacao[];
  total_operacoes: number;
};

export async function memoriaSimular(
  operacoes: Operacao[]
): Promise<AlocadorResult> {
  return apiFetch<AlocadorResult>("/api/memoria/simular/", {
    method: "POST",
    body: JSON.stringify({ operacoes }),
  });
}
