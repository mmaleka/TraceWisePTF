from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from .models import CNCMachiningRecord, CNCOperation
from .serializers import CNCMachiningSerializer, CNCOperationSerializer
from rest_framework import viewsets

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




class CNCOperationViewSet(viewsets.ModelViewSet):
    queryset = CNCOperation.objects.all().order_by("operation_number")
    serializer_class = CNCOperationSerializer
