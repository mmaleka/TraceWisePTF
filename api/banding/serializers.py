from rest_framework import serializers
from .models import Banding

class BandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banding
        fields = '__all__'
        read_only_fields = ['recorded_by', 'date']
