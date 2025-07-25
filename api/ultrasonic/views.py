

# ultrasonic/views.py
from rest_framework import generics, permissions
from .models import UltrasonicTest
from .serializers import UltrasonicTestSerializer
from api.heat_treatment.models import HeatTreatmentBatch

class UltrasonicTestListCreateView(generics.ListCreateAPIView):
    queryset = UltrasonicTest.objects.all().order_by('-date')
    serializer_class = UltrasonicTestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        cast_code = self.request.data.get("cast_code")
        heat_code = self.request.data.get("heat_code")

        # Check for matching and released heat treatment
        heat_treatment = HeatTreatmentBatch.objects.filter(
            cast_code=cast_code,
            heat_code=heat_code,
            released_by__isnull=False  # Only released certificates
        ).first()

        if not heat_treatment:
            raise serializers.ValidationError("Heat treatment certificate not released")

        serializer.save(recorded_by=self.request.user, heat_treatment=heat_treatment)


class UltrasonicTestRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UltrasonicTest.objects.all()
    serializer_class = UltrasonicTestSerializer
    permission_classes = [permissions.IsAuthenticated]




