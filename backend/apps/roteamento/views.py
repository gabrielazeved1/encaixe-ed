from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from .serializers import RoteamentoSerializer
from core.estruturas.graph import Graph


class RoteamentoView(APIView):
    def post(self, request: Request) -> Response:
        serializer = RoteamentoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        grafo = Graph()
        for no in data["nos"]:
            grafo.add_no(no)
        for aresta in data["arestas"]:
            grafo.add_aresta(aresta["origem"], aresta["destino"], aresta["custo"])
        resultado = grafo.dijkstra(data["origem"], data["destino"])
        return Response(resultado)
