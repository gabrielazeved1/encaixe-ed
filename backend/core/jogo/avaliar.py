from dataclasses import dataclass

from core.jogo import token
from core.jogo.explicacoes import EXPLICACOES


class PalpiteInvalido(Exception):
    pass


@dataclass(frozen=True)
class Veredito:
    acertou: bool
    estrutura_correta: str
    explicacao: str


def avaliar(
    token_: str, palpite: str, secret: bytes, agora: int
) -> Veredito:
    if palpite not in token.ESTRUTURAS_VALIDAS:
        raise PalpiteInvalido(f"palpite inválido: {palpite!r}")

    claims = token.decode(token_, secret, agora=agora)
    estrutura = claims["e"]
    return Veredito(
        acertou=(palpite == estrutura),
        estrutura_correta=estrutura,
        explicacao=EXPLICACOES[estrutura],
    )
