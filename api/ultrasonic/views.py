from rest_framework import generics, permissions
from .models import UltrasonicTest
from .serializers import UltrasonicTestSerializer

class UltrasonicTestListCreateView(generics.ListCreateAPIView):
    queryset = UltrasonicTest.objects.all().order_by('-date')
    serializer_class = UltrasonicTestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class UltrasonicTestRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UltrasonicTest.objects.all()
    serializer_class = UltrasonicTestSerializer
    permission_classes = [permissions.IsAuthenticated]