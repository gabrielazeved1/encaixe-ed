from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from .serializers import BuscaHashSerializer, DADOS_PADRAO
from core.estruturas.hash_table import comparar_busca


class BuscaHashView(APIView):
    def post(self, request: Request) -> Response:
        serializer = BuscaHashSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        dados = data.get("dados") or DADOS_PADRAO
        resultado = comparar_busca(dados, data["chave"])
        return Response(resultado)
