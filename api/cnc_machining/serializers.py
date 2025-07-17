from rest_framework import serializers
from .models import CNCMachiningRecord

class CNCMachiningSerializer(serializers.ModelSerializer):
    class Meta:
        model = CNCMachiningRecord
        fields = '__all__'
        read_only_fields = ['recorded_by', 'date_recorded']
