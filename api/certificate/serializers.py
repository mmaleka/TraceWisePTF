from rest_framework import serializers
from .models import CertificateOfConformance, CofCComponent
from api.product.models import Product



class CofCComponentSerializer(serializers.ModelSerializer):
    id=serializer.IntegerField(read_only=True)
    
    class Meta:
        model = CofCComponent
        fields = ["id", "certificate", "serial", "cast_code", "heat_code"]


class CertificateOfConformanceSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = CertificateOfConformance
        fields = [
            "id", "coc_number", "product", "comments", "user",
            "quantity", "complete", "date"
        ]
        read_only_fields = ["coc_number", "user", "date"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
