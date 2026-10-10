export type Destaque = string;

export type Passo<E> = {
  indice: number;
  descricao: string;
  destaques: Destaque[];
  estado: E;
};

export type FramePilha = {
  nome_funcao: string;
  argumento: number;
  retorno: number | null;
  profundidade: number;
};
export type EstadoPilha = FramePilha[];

export type NoBst = {
  valor: number;
  esq: NoBst | null;
  dir: NoBst | null;
} | null;
export type EstadoBst = NoBst;

export type ParChaveValor = [string, unknown];
export type EstadoHash = {
  tamanho: number;
  buckets: ParChaveValor[][];
};

export type PassoPilha = Passo<EstadoPilha>;
export type PassoBst = Passo<EstadoBst>;
export type PassoHash = Passo<EstadoHash>;
