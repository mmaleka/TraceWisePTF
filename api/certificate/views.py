from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import CertificateOfConformance
from .serializers import CertificateOfConformanceSerializer

class CertificateOfConformanceViewSet(viewsets.ModelViewSet):
    queryset = CertificateOfConformance.objects.all().order_by("-date")
    serializer_class = CertificateOfConformanceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
