from rest_framework import serializers
from .models import FinalInspectionRecord
from api.heat_treatment.models import HeatTreatmentBatch

class FinalInspectionRecordSerializer(serializers.ModelSerializer):
    inspector = serializers.StringRelatedField(read_only=True)
    allow_duplicate = serializers.BooleanField(
        write_only=True, required=False, default=False,
        help_text="Allow reinspection of an already recorded shell. Marks it as Rework with 'Duplicate' defect."
    )

    class Meta:
        model = FinalInspectionRecord
        fields = [
            "id", "serial", "cast_code", "heat_code", "determination", "defects",
            "dim_1", "dim_2", "dim_3", "dim_4", "dim_5",
            "dim_6", "dim_7", "dim_8", "dim_9", "dim_10",
            "heat_treatment", "inspector", "date",
            "allow_duplicate"  # write-only field for control
        ]
        read_only_fields = ["heat_treatment", "inspector", "date"]

    def validate(self, data):
        serial = data.get("serial")
        cast_code = data.get("cast_code")
        heat_code = data.get("heat_code")
        allow_duplicate = data.get("allow_duplicate", False)

        # Ensure matching heat treatment exists
        batch = HeatTreatmentBatch.objects.filter(
            cast_code=cast_code, heat_code=heat_code
        ).first()

        if not batch:
            raise serializers.ValidationError("Heat treatment not released for component.")

        # Prevent soft/hard shell entries
        if serial in [batch.soft_shell, batch.hard_shell]:
            raise serializers.ValidationError(
                "Serial is part of the soft or hard components for this heat treatment batch."
            )

        # Block duplicate PASS entries (Rework/Scrap are okay if allowed)
        if FinalInspectionRecord.objects.filter(
            serial=serial,
            cast_code=cast_code,
            heat_code=heat_code,
            determination="Pass"
        ).exists():
            raise serializers.ValidationError(
                "This component has already passed final inspection and cannot be inspected again."
            )

        return data

    def create(self, validated_data):
        validated_data["inspector"] = self.context["request"].user
        validated_data["heat_treatment"] = self._find_heat_batch(validated_data)

        allow_duplicate = validated_data.pop("allow_duplicate", False)

        if allow_duplicate:
            # If any record exists with same identifiers (regardless of determination)
            existing_qs = FinalInspectionRecord.objects.filter(
                serial=validated_data["serial"],
                cast_code=validated_data["cast_code"],
                heat_code=validated_data["heat_code"]
            )
            if existing_qs.exists():
                validated_data["determination"] = "Rework"
                defects = validated_data.get("defects", "").strip()
                if "Duplicate" not in defects:
                    validated_data["defects"] = f"{defects}; Duplicate" if defects else "Duplicate"

        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data["heat_treatment"] = self._find_heat_batch(validated_data)
        return super().update(instance, validated_data)

    def _find_heat_batch(self, data):
        return HeatTreatmentBatch.objects.filter(
            cast_code=data.get("cast_code"),
            heat_code=data.get("heat_code")
        ).first()



# class FinalInspectionRecordSerializer(serializers.ModelSerializer):
#     inspector = serializers.StringRelatedField(read_only=True)

#     class Meta:
#         model = FinalInspectionRecord
#         fields = [
#             "id", "serial", "cast_code", "heat_code", "determination", "defects",
#             "dim_1", "dim_2", "dim_3", "dim_4", "dim_5",
#             "dim_6", "dim_7", "dim_8", "dim_9", "dim_10",
#             "heat_treatment", "inspector", "date"
#         ]
#         read_only_fields = ["heat_treatment", "inspector", "date"]

#     def validate(self, data):
#         serial = data.get("serial")
#         cast_code = data.get("cast_code")
#         heat_code = data.get("heat_code")

#         # 1. Heat treatment batch must exist
#         batch = HeatTreatmentBatch.objects.filter(
#             cast_code=cast_code, heat_code=heat_code
#         ).first()

#         if not batch:
#             raise serializers.ValidationError("Heat treatment not released for component.")

#         # 2. Serial must NOT match soft or hard shell component
#         if serial in [batch.soft_shell, batch.hard_shell]:
#             raise serializers.ValidationError(
#                 "Serial is part of the soft or hard components for this heat treatment batch."
#             )

#         # 3. Serial must not already have a 'Pass' record
#         if FinalInspectionRecord.objects.filter(
#             serial=serial, cast_code=cast_code, heat_code=heat_code, determination="Pass"
#         ).exists():
#             raise serializers.ValidationError(
#                 "This component has already passed final inspection and cannot be inspected again."
#             )

#         return data

#     def create(self, validated_data):
#         validated_data["inspector"] = self.context["request"].user
#         validated_data["heat_treatment"] = self._find_heat_batch(validated_data)
#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         validated_data["heat_treatment"] = self._find_heat_batch(validated_data)
#         return super().update(instance, validated_data)

#     def _find_heat_batch(self, data):
#         return HeatTreatmentBatch.objects.filter(
#             cast_code=data.get("cast_code"),
#             heat_code=data.get("heat_code")
#         ).first()







