from dataclasses import dataclass

from core.jogo import token
from core.jogo.explicacoes import obter_explicacao
from core.jogo.perguntas import Pergunta
from core.jogo.sortear import gerar_rodada


class PalpiteInvalido(Exception):
    pass


ESTAGIOS_VALIDOS = ("estrutura", "operacao", "complexidade")


@dataclass(frozen=True)
class VereditoParcial:
    camada: str
    acertou: bool
    correto: str
    explicacao: str
    proxima_pergunta: Pergunta | None


def avaliar(
    token_: str,
    estagio: str,
    palpite: str,
    secret: bytes,
    agora: int,
) -> VereditoParcial:
    if estagio not in ESTAGIOS_VALIDOS:
        raise ValueError(f"estagio inválido: {estagio!r}")

    claims = token.decode(token_, secret, agora=agora)
    interna = gerar_rodada(claims["s"])

    perguntas_por_camada = {
        "estrutura": interna.pergunta_estrutura,
        "operacao": interna.pergunta_operacao,
        "complexidade": interna.pergunta_complexidade,
    }
    pergunta_atual = perguntas_por_camada[estagio]

    if palpite not in pergunta_atual.alternativas:
        raise PalpiteInvalido(f"palpite inválido: {palpite!r}")

    correto = pergunta_atual.alternativas[pergunta_atual.indice_correto]
    acertou = palpite == correto
    explicacao = obter_explicacao(interna.estrutura, estagio, acertou)

    if estagio == "estrutura":
        proxima = interna.pergunta_operacao
    elif estagio == "operacao":
        proxima = interna.pergunta_complexidade
    else:
        proxima = None

    return VereditoParcial(
        camada=estagio,
        acertou=acertou,
        correto=correto,
        explicacao=explicacao,
        proxima_pergunta=proxima,
    )
