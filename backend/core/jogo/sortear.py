import secrets
from dataclasses import dataclass
from random import Random
from typing import NamedTuple

from core.estruturas.passos import Passo
from core.jogo import token
from core.jogo.neutralidade import (
    VazamentoDeNome,
    varredura_neutra,
    varredura_neutra_texto,
)
from core.jogo.operacoes import OPERACOES
from core.jogo.perguntas import Pergunta, montar_pergunta


MAX_TENTATIVAS = 10


@dataclass
class Rodada:
    token: str
    passos: list[Passo]
    pergunta_estrutura: Pergunta


class RodadaInterna(NamedTuple):
    estrutura: str
    operacao: str
    passos: list[Passo]
    pergunta_estrutura: Pergunta
    pergunta_operacao: Pergunta
    pergunta_complexidade: Pergunta


def gerar_rodada(seed: int) -> RodadaInterna:
    """Replay determinístico do sorteio a partir da seed.

    Produz todas as 3 perguntas usando o mesmo rng, para que sortear e avaliar
    operem sobre as mesmas alternativas sem precisar persistir estado.
    """
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
        p_estrutura = montar_pergunta(estrutura, op.nome, "estrutura", rng)
        try:
            varredura_neutra_texto(p_estrutura.enunciado)
        except VazamentoDeNome:
            continue
        p_operacao = montar_pergunta(estrutura, op.nome, "operacao", rng)
        p_complexidade = montar_pergunta(estrutura, op.nome, "complexidade", rng)
        return RodadaInterna(
            estrutura=estrutura,
            operacao=op.nome,
            passos=passos,
            pergunta_estrutura=p_estrutura,
            pergunta_operacao=p_operacao,
            pergunta_complexidade=p_complexidade,
        )

    raise RuntimeError(
        f"não foi possível gerar rodada neutra em {MAX_TENTATIVAS} tentativas"
    )


def sortear(seed: int | None, secret: bytes, agora: int) -> Rodada:
    if seed is None:
        seed = secrets.randbits(32)

    interna = gerar_rodada(seed)
    claims = {"e": interna.estrutura, "op": interna.operacao, "s": seed, "t": agora}
    tok = token.encode(claims, secret)
    return Rodada(
        token=tok,
        passos=interna.passos,
        pergunta_estrutura=interna.pergunta_estrutura,
    )
