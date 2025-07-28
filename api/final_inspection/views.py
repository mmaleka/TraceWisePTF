

from rest_framework import generics, permissions, serializers
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import FinalInspectionRecord
from .serializers import FinalInspectionRecordSerializer


# 📁 final_inspection/views.py
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import FinalInspectionRecord
from .serializers import FinalInspectionRecordSerializer
from api.certificate.models import CofCComponent

class AvailableForCofCView(ListAPIView):
    serializer_class = FinalInspectionRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        product_id = self.request.query_params.get("product_id")
        search = self.request.query_params.get("search", "").strip()

        used_components = CofCComponent.objects.values_list("serial", "cast_code", "heat_code")

        filters = Q(determination="Pass")

        if product_id:
            filters &= Q(heat_treatment__product_id=product_id)

        if search:
            filters &= (
                Q(serial__icontains=search) |
                Q(cast_code__icontains=search) |
                Q(heat_code__icontains=search)
            )

        exclude_q = Q()
        for serial, cast_code, heat_code in used_components:
            exclude_q |= Q(serial=serial, cast_code=cast_code, heat_code=heat_code)

        return FinalInspectionRecord.objects.filter(filters).exclude(exclude_q)



class FinalInspectionRecordViewSet(viewsets.ModelViewSet):
    queryset = FinalInspectionRecord.objects.all().order_by("-date")
    serializer_class = FinalInspectionRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get("product")

        if product_id:
            queryset = queryset.filter(heat_treatment__product_id=product_id).order_by("-date")

        return queryset

    # def get_queryset(self):
    #     return FinalInspectionRecord.objects.all().order_by("-date")

    def perform_create(self, serializer):
        serializer.save(inspector=self.request.user)

    def create(self, request, *args, **kwargs):
        if isinstance(request.data, list):
            results = []
            errors = []

            for record_data in request.data:
                serializer = self.get_serializer(data=record_data)
                try:
                    serializer.is_valid(raise_exception=True)
                    instance = serializer.save(inspector=request.user)
                    results.append(instance)
                except serializers.ValidationError as e:
                    errors.append({"serial": record_data.get("serial"), "error": e.detail})

            if errors:
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

            return Response(self.get_serializer(results, many=True).data, status=status.HTTP_201_CREATED)

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
            cast_code=data.get("cast_code"),
            heat_code=data.get("heat_code")
        ).first()
