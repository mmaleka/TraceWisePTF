# heat_treatment/serializers.py
from rest_framework import serializers
from api.product.models import Product
from .models import HeatTreatmentBatch, HTComponent

class HeatTreatmentBatchSerializer(serializers.ModelSerializer):
    recorded_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = HeatTreatmentBatch
        fields = '__all__'


class HTComponentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    product = serializers.PrimaryKeyRelatedField(source='batch.product', queryset=Product.objects.all())

    class Meta:
        model = HTComponent
        fields = ['id', 'serial', 'cast_code', 'heat_code', 'hardness_value', 'product']