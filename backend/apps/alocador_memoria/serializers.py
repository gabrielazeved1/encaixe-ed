from rest_framework import serializers

TIPOS = ["alocar", "liberar"]


class OperacaoSerializer(serializers.Serializer):
    tipo = serializers.ChoiceField(choices=TIPOS)
    tamanho = serializers.IntegerField(min_value=1, max_value=256, required=False)
    bloco_id = serializers.IntegerField(min_value=0, required=False)

    def validate(self, data: dict) -> dict:
        if data["tipo"] == "alocar" and "tamanho" not in data:
            raise serializers.ValidationError("tamanho obrigatório para alocar")
        if data["tipo"] == "liberar" and "bloco_id" not in data:
            raise serializers.ValidationError("bloco_id obrigatório para liberar")
        return data


class AlocadorSerializer(serializers.Serializer):
    operacoes = OperacaoSerializer(many=True, min_length=1, max_length=20)
