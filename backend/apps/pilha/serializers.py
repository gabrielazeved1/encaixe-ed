from rest_framework import serializers

FUNCOES_VALIDAS = ["fatorial", "fibonacci"]


class PilhaSimularSerializer(serializers.Serializer):
    funcao = serializers.ChoiceField(
        choices=FUNCOES_VALIDAS,
        error_messages={"invalid_choice": "Função inválida. Use: fatorial, fibonacci."},
    )
    valor = serializers.IntegerField(
        min_value=1,
        error_messages={
            "min_value": "Valor deve ser um inteiro positivo.",
            "invalid": "Tipo inválido para o campo valor.",
            "required": "Campo obrigatório.",
        },
    )
