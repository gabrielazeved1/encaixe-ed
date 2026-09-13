from rest_framework import serializers

ALGORITMOS = ["round-robin", "prioridade"]


class ProcessoSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=50)
    nome = serializers.CharField(max_length=100)
    duracao = serializers.IntegerField(min_value=1, max_value=1000)
    prioridade = serializers.IntegerField(
        min_value=1, max_value=10, required=False, default=5
    )


class EscalonadorSerializer(serializers.Serializer):
    processos = ProcessoSerializer(many=True)
    algoritmo = serializers.ChoiceField(choices=ALGORITMOS)
    quantum = serializers.IntegerField(
        min_value=1, max_value=100, required=False, default=4
    )

    def validate_processos(self, value: list[dict]) -> list[dict]:
        if len(value) < 1 or len(value) > 10:
            raise serializers.ValidationError("entre 1 e 10 processos")
        return value
