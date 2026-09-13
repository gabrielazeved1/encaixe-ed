from rest_framework import serializers


class IndiceBSTSerializer(serializers.Serializer):
    valores = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=10000),
        min_length=1,
        max_length=31,
    )
    alvo = serializers.IntegerField(min_value=0, max_value=10000)
