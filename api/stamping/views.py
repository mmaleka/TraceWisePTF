from rest_framework import generics, permissions
from .models import Stamping
from .serializers import StampingSerializer

class StampingListCreateView(generics.ListCreateAPIView):
    queryset = Stamping.objects.all().order_by('-date')
    serializer_class = StampingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

class StampingRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stamping.objects.all()
    serializer_class = StampingSerializer
    permission_classes = [permissions.IsAuthenticated]
