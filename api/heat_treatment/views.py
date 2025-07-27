# heat_treatment/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import HeatTreatmentBatch, HTComponent
from .serializers import HeatTreatmentBatchSerializer, HTComponentSerializer
# heat_treatment/views.py
from rest_framework import viewsets
# heat_treatment/views.py
from rest_framework import generics
from api.stamping.models import Stamping


@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def perform_create(self, serializer):
        data = self.request.data
        product_id = data.get("product")
        cast_code = data.get("cast_code")
        heat_code = data.get("heat_code")

        batch, created = HeatTreatmentBatch.objects.get_or_create(
            product_id=product_id,
            cast_code=cast_code,
            heat_code=heat_code,
            defaults={
                'hard_shell': 0,
                'soft_shell': 0,
                'quantity': 0,
                'released_by': self.request.user,
            }
        )

        serializer.save(batch=batch)
@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def list_batches(request):
    batches = HeatTreatmentBatch.objects.all().order_by('-released_at')
    serializer = HeatTreatmentBatchSerializer(batches, many=True)
    return Response(serializer.data)




class HTComponentViewSet(viewsets.ModelViewSet):
    serializer_class = HTComponentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        batch_id = self.request.query_params.get("batch")
        if batch_id:
            return HTComponent.objects.filter(batch_id=batch_id)
        return HTComponent.objects.all()

    def perform_create(self, serializer):
        data = self.request.data
        product_id = data.get("product")
        cast_code = data.get("cast_code")
        heat_code = data.get("heat_code")

        batch, created = HeatTreatmentBatch.objects.get_or_create(
            product_id=product_id,
            cast_code=cast_code,
            heat_code=heat_code,
            defaults={
                'hard_shell': 0,
                'soft_shell': 0,
                'quantity': 0,
                'released_by': self.request.user,
            }
        )

        serializer.save(batch=batch)



class ReleasedHTComponentListView(generics.ListAPIView):
    serializer_class = HTComponentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        product_id = self.request.query_params.get("product")
        stamped = Stamping.objects.values_list("serial", "cast_code", "heat_code")
        stamped_set = set(stamped)

        qs = HTComponent.objects.filter(batch__released_by__isnull=False).select_related("batch")

        if product_id:
            qs = qs.filter(batch__product_id=product_id)

        return [
            comp for comp in qs
            if (comp.serial, comp.cast_code, comp.heat_code) not in stamped_set
        ]
