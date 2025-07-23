from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import CertificateOfConformanceSerializer, CofCComponentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import CofCComponent, CertificateOfConformance
from api.heat_treatment.models import HeatTreatmentBatch
from api.ultrasonic.models import UltrasonicTest
from api.final_inspection.models import FinalInspectionRecord

from rest_framework import generics



class CofCComponentViewSet(viewsets.ModelViewSet):
    serializer_class = CofCComponentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # If detail view (e.g., DELETE api/certificate/components/1/), allow full queryset
        if self.action in ['retrieve', 'destroy', 'update', 'partial_update']:
            return CofCComponent.objects.all()

        certificate_id = self.request.query_params.get("certificate")
        if certificate_id:
            return CofCComponent.objects.filter(certificate_id=certificate_id)
        return CofCComponent.objects.none()

    def perform_create(self, serializer):
        serializer.save()



class VerifyCofCComponents(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        certificate_id = request.query_params.get("certificate")
        if not certificate_id:
            return Response({"error": "Missing certificate ID"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch certificate
        try:
            certificate = CertificateOfConformance.objects.get(id=certificate_id)
        except CertificateOfConformance.DoesNotExist:
            return Response({"error": "Certificate not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get CofC components
        components = CofCComponent.objects.filter(certificate_id=certificate_id)
        serials = components.values_list("serial", flat=True)

        # Set quantity directly
        certificate.quantity = components.count()

        # Check each linked requirement
        missing_heat_treatment = []
        missing_ut = []
        missing_mpi = []
        # missing_balancing = []
        missing_final_inspection = []

        for serial in serials:
            heat = HeatTreatmentBatch.objects.filter(serial=serial).first()
            if not heat:
                missing_heat_treatment.append(serial)
                continue

            if not UltrasonicTest.objects.filter(heat_treatment=heat).exists():
                missing_ut.append(serial)

            # if not MPIResult.objects.filter(heat_treatment=heat).exists():
            #     missing_mpi.append(serial)

            # if not BalancingData.objects.filter(heat_treatment=heat).exists():
            #     missing_balancing.append(serial)

            if not FinalInspectionRecord.objects.filter(heat_treatment=heat).exists():
                missing_final_inspection.append(serial)

        # Helper to summarize results
        def summarize(missing_list):
            return "All Complete" if not missing_list else ", ".join(missing_list)

        # Update CofC status fields
        certificate.heat_treatment = summarize(missing_heat_treatment)
        certificate.ut = summarize(missing_ut)
        certificate.mpi = summarize(missing_mpi)
        certificate.final_inspection = summarize(missing_final_inspection)

        # Complete if no missing
        certificate.complete = all([
            not missing_heat_treatment,
            not missing_ut,
            not missing_mpi,
            # not missing_balancing,
            not missing_final_inspection
        ])

        certificate.save()

        return Response({
            "missing": {
                "heat_treatment": missing_heat_treatment,
                "UT": "All Complete" if not missing_ut else missing_ut,
                "MPI": "All Complete" if not missing_mpi else missing_mpi,
                # "Balancing": "All Complete" if not missing_balancing else missing_balancing,
                "final_inspection": "All Complete" if not missing_final_inspection else missing_final_inspection,
            },
            "complete": certificate.complete,
            "quantity": certificate.quantity,
        }, status=status.HTTP_200_OK)



class CertificateOfConformanceViewSet(viewsets.ModelViewSet):
    queryset = CertificateOfConformance.objects.all().order_by("-date")
    serializer_class = CertificateOfConformanceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
