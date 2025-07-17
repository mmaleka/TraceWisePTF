from rest_framework import serializers
from .models import Stamping
from api.heat_treatment.models import HeatTreatmentBatch

class StampingSerializer(serializers.ModelSerializer):
    
    heat_treatment = serializers.PrimaryKeyRelatedField(queryset=HeatTreatmentBatch.objects.all(), required=False, allow_null=True)
    

    class Meta:
        model = Stamping
        fields = '__all__'
