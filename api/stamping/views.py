from rest_framework import generics, permissions
from .models import Stamping
from .serializers import StampingSerializer
from api.heat_treatment.helpers import get_heat_treatment_or_none

class StampingListCreateView(generics.ListCreateAPIView):
    queryset = Stamping.objects.all().order_by('-date')
    serializer_class = StampingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        cast_code = self.request.data.get("cast_code")
        heat_code = self.request.data.get("heat_code")
        heat_treatment = get_heat_treatment_or_none(cast_code, heat_code)

        serializer.save(
            recorded_by=self.request.user,
            heat_treatment=heat_treatment  # sets FK if found, else None
        )


class StampingRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stamping.objects.all()
    serializer_class = StampingSerializer
    permission_classes = [permissions.IsAuthenticated]
