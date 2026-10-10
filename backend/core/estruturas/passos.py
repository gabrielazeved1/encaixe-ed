from typing import TypedDict


type Destaque = str


class Passo(TypedDict):
    indice: int
    descricao: str
    destaques: list[Destaque]
    estado: object


type PassoColetor = list[Passo]


def fazer_passo(
    coletor: PassoColetor,
    descricao: str,
    destaques: list[Destaque],
    estado: object,
) -> None:
    assert descricao, "descricao não pode ser vazia"
    coletor.append(
        Passo(
            indice=len(coletor),
            descricao=descricao,
            destaques=list(destaques),
            estado=estado,
        )
    )
