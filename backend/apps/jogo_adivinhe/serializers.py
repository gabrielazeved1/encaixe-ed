from rest_framework import serializers


ESTRUTURAS_CHOICES = ["pilha", "fila", "heap", "hash", "bst", "linkedlist", "grafo"]


class RodadaQuerySerializer(serializers.Serializer):
    seed = serializers.IntegerField(
        required=False,
        min_value=0,
        error_messages={
            "min_value": "seed deve ser um inteiro não-negativo",
            "invalid": "seed deve ser um inteiro não-negativo",
        },
    )


class PalpiteSerializer(serializers.Serializer):
    token = serializers.CharField()
    palpite = serializers.ChoiceField(
        choices=ESTRUTURAS_CHOICES,
        error_messages={
            "invalid_choice": (
                "palpite deve ser uma das 7 estruturas: "
                "pilha, fila, heap, hash, bst, linkedlist, grafo"
            )
        },
    )
