from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from .serializers import PilhaSimularSerializer
from core.estruturas.stack import simular_pilha


class PilhaView(APIView):
    def post(self, request: Request) -> Response:
        serializer = PilhaSimularSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        result = simular_pilha(
            serializer.validated_data["funcao"],
            serializer.validated_data["valor"],
        )
        return Response(result)
