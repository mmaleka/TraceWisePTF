from rest_framework import serializers
from .models import Stamping
from api.heat_treatment.models import HeatTreatmentBatch

class StampingSerializer(serializers.ModelSerializer):
    
    heat_treatment = serializers.PrimaryKeyRelatedField(queryset=HeatTreatmentBatch.objects.all(), required=False, allow_null=True)
    user = serializers.CharField(source='recorded_by.username', read_only=True)
    product_name = serializers.CharField(source='heat_treatment.product.name', read_only=True)

    class Meta:
        model = Stamping
        fields = [
            'id', 'serial', 'cast_code', 'heat_code', 'heat_treatment',
            'recorded_by', 'user', 'product_name', 'date'
        ]
