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


# heat_treatment/views_certificate_update.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import HeatTreatmentBatch, HTComponent
from .serializers import HeatTreatmentBatchSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lookup_product_by_cast_and_heat(request):
    cast_code = request.GET.get("cast_code")
    heat_code = request.GET.get("heat_code")

    if not cast_code or not heat_code:
        return Response({"detail": "Both cast_code and heat_code are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        component = HTComponent.objects.filter(cast_code=cast_code, heat_code=heat_code).first()
        if component:
            return Response({"product": component.product})
        return Response({"product": None})
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_batch_certificate(request, batch_id):
    try:
        batch = HeatTreatmentBatch.objects.get(pk=batch_id)
    except HeatTreatmentBatch.DoesNotExist:
        return Response({"detail": "Batch not found."}, status=status.HTTP_404_NOT_FOUND)

    certificate = request.FILES.get("certificate")
    if not certificate:
        return Response({"detail": "Certificate file is required."}, status=status.HTTP_400_BAD_REQUEST)

    batch.certificate = certificate


    

    

    # Auto recalc hard_shell, soft_shell, quantity based on HTComponents
    components = HTComponent.objects.filter(batch=batch)
    # Example hardness threshold for hard_shell vs soft_shell:
    HARDNESS_THRESHOLD = 50.0

    # hard_shell = components.filter(hardness_value__gte=HARDNESS_THRESHOLD).count()
    # soft_shell = components.filter(hardness_value__lt=HARDNESS_THRESHOLD).count()

    # Component with the highest hardness value
    hardest_component = components.order_by("-hardness_value").first()
    # Component with the lowest hardness value
    softest_component = components.order_by("hardness_value").first()

    # Assign the serial numbers
    batch.hard_shell = hardest_component.serial
    batch.soft_shell = softest_component.serial

    quantity = components.count()

    # batch.hard_shell = hard_shell
    # batch.soft_shell = soft_shell
    batch.quantity = quantity

    batch.save()

    serializer = HeatTreatmentBatchSerializer(batch)
    return Response(serializer.data, status=status.HTTP_200_OK)



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
