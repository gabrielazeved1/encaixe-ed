from rest_framework import serializers


class EntradaSerializer(serializers.Serializer):
    chave = serializers.CharField(max_length=100)
    valor = serializers.CharField(max_length=200)


DADOS_PADRAO: list[dict[str, str]] = [
    {"chave": f"registro_{i:03d}", "valor": f"valor_{i}"} for i in range(1, 21)
]


class BuscaHashSerializer(serializers.Serializer):
    chave = serializers.CharField(max_length=100)
    dados = EntradaSerializer(many=True, required=False)
