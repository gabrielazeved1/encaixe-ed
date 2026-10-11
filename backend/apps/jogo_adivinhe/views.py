import time

from django.conf import settings
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.jogo.avaliar import PalpiteInvalido, VereditoParcial, avaliar
from core.jogo.explicacoes import obter_explicacao
from core.jogo.perguntas import Pergunta
from core.jogo.sortear import sortear
from core.jogo.token import TokenExpirado, TokenInvalido

from .serializers import PalpiteRequestSerializer, RodadaQuerySerializer


def _secret() -> bytes:
    return settings.SECRET_KEY.encode("utf-8")


def _pergunta_revelada(p: Pergunta) -> dict:
    return {
        "camada": p.camada,
        "enunciado": p.enunciado,
        "alternativas": list(p.alternativas),
    }


def _pergunta_completa(p: Pergunta, estrutura: str) -> dict:
    return {
        "camada": p.camada,
        "enunciado": p.enunciado,
        "alternativas": list(p.alternativas),
        "indice_correto": p.indice_correto,
        "explicacao_acerto": obter_explicacao(estrutura, p.camada, True),
        "explicacao_erro": obter_explicacao(estrutura, p.camada, False),
    }


def _veredito_dict(v: VereditoParcial) -> dict:
    return {
        "camada": v.camada,
        "acertou": v.acertou,
        "correto": v.correto,
        "explicacao": v.explicacao,
        "proxima_pergunta": (
            _pergunta_revelada(v.proxima_pergunta)
            if v.proxima_pergunta is not None
            else None
        ),
    }


class RodadaView(APIView):
    def get(self, request: Request) -> Response:
        serializer = RodadaQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        seed = serializer.validated_data.get("seed")
        try:
            rodada = sortear(seed=seed, secret=_secret(), agora=int(time.time()))
        except RuntimeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(
            {
                "token": rodada.token,
                "passos": rodada.passos,
                "pergunta_estrutura": _pergunta_revelada(rodada.pergunta_estrutura),
                "estrutura": rodada.estrutura,
                "perguntas": [
                    _pergunta_completa(p, rodada.estrutura)
                    for p in rodada.perguntas
                ],
            }
        )


class PalpiteView(APIView):
    def post(self, request: Request) -> Response:
        serializer = PalpiteRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        token_ = serializer.validated_data["token"]
        estagio = serializer.validated_data["estagio"]
        palpite = serializer.validated_data["palpite"]
        try:
            veredito = avaliar(
                token_, estagio, palpite, secret=_secret(), agora=int(time.time())
            )
        except PalpiteInvalido:
            return Response(
                {"detail": "palpite inválido"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except ValueError:
            return Response(
                {"detail": "estagio inválido"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except TokenExpirado:
            return Response(
                {"detail": "rodada expirada"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except TokenInvalido:
            return Response(
                {"detail": "token inválido"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(_veredito_dict(veredito))
