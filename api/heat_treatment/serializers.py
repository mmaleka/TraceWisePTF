# heat_treatment/serializers.py
from rest_framework import serializers
from api.product.models import Product
from .models import HeatTreatmentBatch

class HeatTreatmentBatchSerializer(serializers.ModelSerializer):
    recorded_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = HeatTreatmentBatch
        fields = '__all__'
