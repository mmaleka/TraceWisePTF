# banding/serializers.py

from rest_framework import serializers
from .models import Banding

class BandingSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()

    class Meta:
        model = Banding
        fields = '__all__'  # include all model fields + dynamic fields below
        extra_fields = ['product_name', 'product_id']  # Add dynamic fields for clarity
        # read_only_fields = ['recorded_by', 'date']

    def get_product_name(self, obj):
        if obj.heat_treatment and obj.heat_treatment.product:
            return obj.heat_treatment.product.name
        return None

    def get_product_id(self, obj):
        if obj.heat_treatment and obj.heat_treatment.product:
            return obj.heat_treatment.product.id
        return None
