from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from .serializers import IndiceBSTSerializer
from core.estruturas.bst import simular_bst


class IndiceBSTView(APIView):
    def post(self, request: Request) -> Response:
        serializer = IndiceBSTSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        resultado = simular_bst(data["valores"], data["alvo"])
        return Response(resultado)
