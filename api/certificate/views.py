from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication, BasicAuthentication


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



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import CertificateOfConformance, CofCComponent
from api.heat_treatment.models import HTComponent, HeatTreatmentBatch
from api.ultrasonic.models import UltrasonicTest
from api.final_inspection.models import FinalInspectionRecord
from rest_framework.generics import ListAPIView
from django.db.models import Q
from api.final_inspection.serializers import FinalInspectionRecordSerializer

class VerifyCofCComponents(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        certificate_id = request.query_params.get("certificate")
        if not certificate_id:
            return Response({"error": "Missing certificate ID"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            certificate = CertificateOfConformance.objects.get(id=certificate_id)
        except CertificateOfConformance.DoesNotExist:
            return Response({"error": "Certificate not found"}, status=status.HTTP_404_NOT_FOUND)

        components = CofCComponent.objects.filter(certificate_id=certificate_id)
        certificate.quantity = components.count()

        # Lists to track missing validations
        missing_heat_treatment = []
        missing_ut = []
        missing_mpi = []
        missing_final_inspection = []

        for component in components:
            serial = component.serial
            cast_code = component.cast_code
            heat_code = component.heat_code

            ht_component = HTComponent.objects.filter(
                serial=serial,
                cast_code=cast_code,
                heat_code=heat_code
            ).first()

            if not ht_component:
                # If heat treatment itself is missing, all downstream steps are considered missing
                missing_heat_treatment.append([serial, cast_code, heat_code])
                missing_ut.append([serial, cast_code, heat_code])
                missing_mpi.append([serial, cast_code, heat_code])
                missing_final_inspection.append([serial, cast_code, heat_code])
                continue

            batch = ht_component.batch

            # UT check
            if not UltrasonicTest.objects.filter(heat_treatment=batch, operation_type="UT").exists():
                missing_ut.append([serial, cast_code, heat_code])

            # MPI check
            if not UltrasonicTest.objects.filter(heat_treatment=batch, operation_type="MPI").exists():
                missing_mpi.append([serial, cast_code, heat_code])

            # Final Inspection check
            if not FinalInspectionRecord.objects.filter(heat_treatment=batch).exists():
                missing_final_inspection.append([serial, cast_code, heat_code])

        # Helper to summarize missing items
        def summarize(missing_list):
            return "All Complete" if not missing_list else " , ".join(
                ["-".join(map(str, item)) for item in missing_list]
            )

        # Set summary fields
        certificate.heat_treatment = summarize(missing_heat_treatment)
        certificate.ut = summarize(missing_ut)
        certificate.mpi = summarize(missing_mpi)
        certificate.final_inspection = summarize(missing_final_inspection)

        # Completion status
        certificate.complete = all([
            not missing_heat_treatment,
            not missing_ut,
            not missing_mpi,
            not missing_final_inspection
        ])
        certificate.save()

        # Checklist for frontend
        checklist = [
            "❌ Heat Treatment: Missing items" if missing_heat_treatment else "✔ Heat Treatment: All Complete",
            "❌ UT: Missing items" if missing_ut else "✔ UT: All Complete",
            "❌ MPI: Missing items" if missing_mpi else "✔ MPI: All Complete",
            "❌ Final Inspection: Missing items" if missing_final_inspection else "✔ Final Inspection: All Complete"
        ]

        return Response({
            "missing": {
                "heat_treatment": missing_heat_treatment,
                "UT": missing_ut,
                "MPI": missing_mpi,
                "final_inspection": missing_final_inspection,
            },
            "checklist": checklist,
            "complete": certificate.complete,
            "quantity": certificate.quantity,
        }, status=status.HTTP_200_OK)




class CertificateOfConformanceViewSet(viewsets.ModelViewSet):
    queryset = CertificateOfConformance.objects.all().order_by("-date")
    serializer_class = CertificateOfConformanceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
