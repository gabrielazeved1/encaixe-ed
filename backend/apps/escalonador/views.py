from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from .serializers import EscalonadorSerializer
from core.estruturas.queue import simular_escalonador


class EscalonadorView(APIView):
    def post(self, request: Request) -> Response:
        serializer = EscalonadorSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        result = simular_escalonador(
            data["processos"], data["algoritmo"], data.get("quantum", 4)
        )
        return Response(result)
