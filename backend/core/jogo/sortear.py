import secrets
from dataclasses import dataclass
from random import Random

from core.estruturas.passos import Passo
from core.jogo import token
from core.jogo.neutralidade import VazamentoDeNome, varredura_neutra
from core.jogo.operacoes import OPERACOES


MAX_TENTATIVAS = 10


@dataclass
class Rodada:
    token: str
    passos: list[Passo]


def sortear(seed: int | None, secret: bytes, agora: int) -> Rodada:
    if seed is None:
        seed = secrets.randbits(32)

    rng = Random(seed)
    estruturas = sorted(token.ESTRUTURAS_VALIDAS)

    for _ in range(MAX_TENTATIVAS):
        estrutura = rng.choice(estruturas)
        operacoes = OPERACOES[estrutura]
        op = rng.choice(operacoes)
        passos = op.executar(rng)
        if len(passos) < 2:
            continue
        try:
            varredura_neutra(passos)
        except VazamentoDeNome:
            continue
        claims = {"e": estrutura, "s": seed, "t": agora}
        tok = token.encode(claims, secret)
        return Rodada(token=tok, passos=passos)

    raise RuntimeError(
        f"não foi possível gerar rodada neutra em {MAX_TENTATIVAS} tentativas"
    )
