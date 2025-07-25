
from rest_framework import generics, permissions, serializers
from rest_framework.permissions import IsAuthenticated
from .models import CNCMachiningRecord, CNCOperation
from .serializers import CNCMachiningSerializer, CNCOperationSerializer
from rest_framework import viewsets
from api.heat_treatment.models import HeatTreatmentBatch

class CNCMachiningListCreateView(generics.ListCreateAPIView):
    queryset = CNCMachiningRecord.objects.all().order_by('-date_recorded')
    serializer_class = CNCMachiningSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        cast_code = self.request.data.get("cast_code")
        heat_code = self.request.data.get("heat_code")

        heat_treatment = HeatTreatmentBatch.objects.filter(
            cast_code=cast_code,
            heat_code=heat_code,
            released_by__isnull=False  # Only released
        ).first()

        if not heat_treatment:
            raise serializers.ValidationError("Heat treatment certificate not released")

        serializer.save(recorded_by=self.request.user, heat_treatment=heat_treatment)


class CNCMachiningRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CNCMachiningRecord.objects.all()
    serializer_class = CNCMachiningSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save(recorded_by=self.request.user)


class CNCOperationViewSet(viewsets.ModelViewSet):
    queryset = CNCOperation.objects.all().order_by("operation_number")
    serializer_class = CNCOperationSerializer
