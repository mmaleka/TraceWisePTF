from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from .models import CNCMachiningRecord
from .serializers import CNCMachiningSerializer

class CNCMachiningListCreateView(generics.ListCreateAPIView):
    queryset = CNCMachiningRecord.objects.all().order_by('-date_recorded')
    serializer_class = CNCMachiningSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class CNCMachiningRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CNCMachiningRecord.objects.all()
    serializer_class = CNCMachiningSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save(recorded_by=self.request.user)
