from rest_framework import serializers
from .models import UltrasonicTest

class UltrasonicTestSerializer(serializers.ModelSerializer):
    recorded_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = UltrasonicTest
        fields = '__all__'
