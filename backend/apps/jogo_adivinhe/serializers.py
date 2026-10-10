from rest_framework import serializers


CAMADAS_CHOICES = ["estrutura", "operacao", "complexidade"]


class RodadaQuerySerializer(serializers.Serializer):
    seed = serializers.IntegerField(
        required=False,
        min_value=0,
        error_messages={
            "min_value": "seed deve ser um inteiro não-negativo",
            "invalid": "seed deve ser um inteiro não-negativo",
        },
    )


class PerguntaReveladaSerializer(serializers.Serializer):
    camada = serializers.ChoiceField(choices=CAMADAS_CHOICES)
    enunciado = serializers.CharField()
    alternativas = serializers.ListField(
        child=serializers.CharField(), min_length=4, max_length=4
    )


class PalpiteRequestSerializer(serializers.Serializer):
    token = serializers.CharField()
    estagio = serializers.ChoiceField(
        choices=CAMADAS_CHOICES,
        error_messages={
            "invalid_choice": (
                "estagio deve ser um de: estrutura, operacao, complexidade"
            )
        },
    )
    palpite = serializers.CharField()


class VereditoParcialSerializer(serializers.Serializer):
    camada = serializers.ChoiceField(choices=CAMADAS_CHOICES)
    acertou = serializers.BooleanField()
    correto = serializers.CharField()
    explicacao = serializers.CharField()
    proxima_pergunta = PerguntaReveladaSerializer(allow_null=True)
