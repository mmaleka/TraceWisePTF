from rest_framework import generics, permissions
from .models import Banding
from .serializers import BandingSerializer

class BandingListCreateView(generics.ListCreateAPIView):
    queryset = Banding.objects.all().order_by('-date')
    serializer_class = BandingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

class BandingRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Banding.objects.all()
    serializer_class = BandingSerializer
    permission_classes = [permissions.IsAuthenticated]
