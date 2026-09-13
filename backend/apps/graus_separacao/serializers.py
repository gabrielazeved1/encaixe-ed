from rest_framework import serializers


class PessoaSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=50)
    nome = serializers.CharField(max_length=100)


class AmizadeSerializer(serializers.Serializer):
    a = serializers.CharField(max_length=50)
    b = serializers.CharField(max_length=50)


class GrausSeparacaoSerializer(serializers.Serializer):
    pessoas = PessoaSerializer(many=True)
    amizades = AmizadeSerializer(many=True)
    origem = serializers.CharField(max_length=50)
    destino = serializers.CharField(max_length=50)

    def validate(self, data: dict) -> dict:
        ids = {p["id"] for p in data["pessoas"]}
        if data["origem"] not in ids:
            raise serializers.ValidationError("origem não encontrada nas pessoas")
        if data["destino"] not in ids:
            raise serializers.ValidationError("destino não encontrado nas pessoas")
        return data
