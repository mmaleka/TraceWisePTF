from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import FinalInspectionRecord
from .serializers import FinalInspectionRecordSerializer

class FinalInspectionRecordViewSet(viewsets.ModelViewSet):
    queryset = FinalInspectionRecord.objects.all().order_by("-date")
    serializer_class = FinalInspectionRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FinalInspectionRecord.objects.all().order_by("-date")

    def perform_create(self, serializer):
        serializer.save(inspector=self.request.user)

    def create(self, request, *args, **kwargs):
        # Handle batch create
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_bulk_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return super().create(request, *args, **kwargs)

    def perform_bulk_create(self, serializer):
        # Save each item individually with inspector and heat_treatment lookup
        for item in serializer.validated_data:
            FinalInspectionRecord.objects.create(
                inspector=self.request.user,
                heat_treatment=self._find_heat_batch(item),
                **item
            )

    def _find_heat_batch(self, data):
        from api.heat_treatment.models import HeatTreatmentBatch
        return HeatTreatmentBatch.objects.filter(
            serial=data.get("serial"),
            cast_code=data.get("cast_code"),
            heat_code=data.get("heat_code")
        ).first()
