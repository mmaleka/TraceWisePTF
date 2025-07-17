# heat_treatment/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import HeatTreatmentBatch
from .serializers import HeatTreatmentBatchSerializer

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
