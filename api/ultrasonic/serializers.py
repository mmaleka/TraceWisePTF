# ultrasonic/serializers.py
from rest_framework import serializers
from .models import UltrasonicTest

class UltrasonicTestSerializer(serializers.ModelSerializer):
    recorded_by = serializers.StringRelatedField(read_only=True)
    product_name = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()

    class Meta:
        model = UltrasonicTest
        fields = '__all__'
        extra_fields = ['product_name', 'product_id']

    def get_product_name(self, obj):
        if obj.heat_treatment and obj.heat_treatment.product:
            return obj.heat_treatment.product.name
        return None

    def get_product_id(self, obj):
        if obj.heat_treatment and obj.heat_treatment.product:
            return obj.heat_treatment.product.id
        return None


