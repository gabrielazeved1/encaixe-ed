from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from .serializers import GrausSeparacaoSerializer
from core.estruturas.graph import Graph


class GrausSeparacaoView(APIView):
    def post(self, request: Request) -> Response:
        serializer = GrausSeparacaoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        grafo = Graph()
        for pessoa in data["pessoas"]:
            grafo.add_no(pessoa["id"])
        for amizade in data["amizades"]:
            grafo.add_aresta(amizade["a"], amizade["b"])
        resultado = grafo.bfs(data["origem"], data["destino"])
        nomes: dict[str, str] = {p["id"]: p["nome"] for p in data["pessoas"]}
        caminho = resultado["caminho"]
        assert isinstance(caminho, list)
        resultado["nomes_caminho"] = [nomes.get(pid, pid) for pid in caminho]
        return Response(resultado)
