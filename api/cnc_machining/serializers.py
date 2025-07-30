from rest_framework import serializers
from .models import CNCMachiningRecord, CNCOperation

class CNCMachiningSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()
    recorded_by_username = serializers.SerializerMethodField()
    
    class Meta:
        model = CNCMachiningRecord
        fields = '__all__'
        extra_fields = ['product_name', 'product_id', 'recorded_by_username'] # Add dynamic fields for clarity
        # read_only_fields = ['recorded_by', 'date']

    def get_product_name(self, obj):
        if obj.heat_treatment and obj.heat_treatment.product:
            return obj.heat_treatment.product.name
        return None

    def get_product_id(self, obj):
        if obj.heat_treatment and obj.heat_treatment.product:
            return obj.heat_treatment.product.id
        return None



class CNCOperationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CNCOperation
        fields = "__all__"
