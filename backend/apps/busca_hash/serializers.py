from rest_framework import serializers


class EntradaSerializer(serializers.Serializer):
    chave = serializers.CharField(max_length=100)
    valor = serializers.CharField(max_length=200)


_LINGUAGENS = [
    "python", "java", "javascript", "typescript", "rust",
    "go", "swift", "kotlin", "ruby", "php",
    "c", "cpp", "scala", "haskell", "elixir", "dart",
]

DADOS_PADRAO: list[dict[str, str]] = [
    {"chave": lang, "valor": f"linguagem #{i + 1}"}
    for i, lang in enumerate(_LINGUAGENS)
]


class BuscaHashSerializer(serializers.Serializer):
    chave = serializers.CharField(max_length=100)
    dados = EntradaSerializer(many=True, required=False)
