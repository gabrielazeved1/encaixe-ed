from rest_framework import serializers


class ArestaSerializer(serializers.Serializer):
    origem = serializers.CharField(max_length=50)
    destino = serializers.CharField(max_length=50)
    custo = serializers.IntegerField(min_value=1, max_value=1000)


class RoteamentoSerializer(serializers.Serializer):
    nos = serializers.ListField(
        child=serializers.CharField(max_length=50),
        min_length=2,
        max_length=20,
    )
    arestas = ArestaSerializer(many=True)
    origem = serializers.CharField(max_length=50)
    destino = serializers.CharField(max_length=50)

    def validate(self, data: dict) -> dict:
        nos = set(data["nos"])
        if data["origem"] not in nos:
            raise serializers.ValidationError("origem não está na lista de nós")
        if data["destino"] not in nos:
            raise serializers.ValidationError("destino não está na lista de nós")
        return data
