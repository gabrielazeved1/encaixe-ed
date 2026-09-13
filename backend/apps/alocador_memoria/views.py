from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from .serializers import AlocadorSerializer
from core.estruturas.linked_list import simular_alocador


class AlocadorMemoriaView(APIView):
    def post(self, request: Request) -> Response:
        serializer = AlocadorSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        resultado = simular_alocador(data["operacoes"])
        return Response(resultado)
