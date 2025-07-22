from rest_framework import serializers
from .models import FinalInspectionRecord
from api.heat_treatment.models import HeatTreatmentBatch

class FinalInspectionRecordSerializer(serializers.ModelSerializer):
    inspector = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = FinalInspectionRecord
        fields = [
            "id", "serial", "cast_code", "heat_code", "determination", "defects",
            "dim_1", "dim_2", "dim_3", "dim_4", "dim_5",
            "dim_6", "dim_7", "dim_8", "dim_9", "dim_10",
            "heat_treatment", "inspector", "date"
        ]
        read_only_fields = ["heat_treatment", "inspector", "date"]

    
    def create(self, validated_data):
        heat_treatment = self._find_heat_batch(validated_data)
        user = self.context["request"].user
        validated_data["heat_treatment"] = heat_treatment
        validated_data["inspector"] = user
        return super().create(validated_data)


    def update(self, instance, validated_data):
        heat_treatment = self._find_heat_batch(validated_data)
        validated_data["heat_treatment"] = heat_treatment
        return super().update(instance, validated_data)


    def _find_heat_batch(self, data):
        return HeatTreatmentBatch.objects.filter(
            cast_code=data.get("cast_code"),
            heat_code=data.get("heat_code")
        ).first()
