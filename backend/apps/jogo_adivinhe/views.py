import time

from django.conf import settings
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.jogo.avaliar import PalpiteInvalido, avaliar
from core.jogo.sortear import sortear
from core.jogo.token import TokenExpirado, TokenInvalido

from .serializers import PalpiteSerializer, RodadaQuerySerializer


def _secret() -> bytes:
    return settings.SECRET_KEY.encode("utf-8")


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
        return Response({"token": rodada.token, "passos": rodada.passos})


class PalpiteView(APIView):
    def post(self, request: Request) -> Response:
        serializer = PalpiteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        token = serializer.validated_data["token"]
        palpite = serializer.validated_data["palpite"]
        try:
            veredito = avaliar(
                token, palpite, secret=_secret(), agora=int(time.time())
            )
        except PalpiteInvalido:
            return Response(
                {"detail": "palpite inválido"},
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
        return Response(
            {
                "acertou": veredito.acertou,
                "estrutura_correta": veredito.estrutura_correta,
                "explicacao": veredito.explicacao,
            }
        )
