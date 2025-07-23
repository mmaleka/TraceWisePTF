# heat_treatment/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import HeatTreatmentBatch, HTComponent
from .serializers import HeatTreatmentBatchSerializer, HTComponentSerializer
# heat_treatment/views.py
from rest_framework import viewsets


@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def release_batch(request):
    serializer = HeatTreatmentBatchSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(released_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
