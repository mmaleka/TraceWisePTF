from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from api.heat_treatment.models import HTComponent
from api.cnc_machining.models import CNCMachiningRecord
from api.ultrasonic.models import UltrasonicTest
from api.stamping.models import Stamping
from api.banding.models import Banding
# from api.nosethread.models import NoseThreadRecord
# from api.mpi.models import MPIRecord
from api.final_inspection.models import FinalInspectionRecord
from api.certificate.models import CertificateOfConformance

class WIPSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        product_id = request.query_params.get("product")
        components = HTComponent.objects.filter(batch__product_id=product_id)

        operations = [
            (2, "Pre-machine Ogive"),
            (3, "Final Machine Ogive"),
            (4, "Ultrasonic"),
            (5, "Stamping"),
            (6, "Banding"),
            (7, "Nose Threads"),
            (8, "MPI"),
            (9, "Final Inspection"),
            (10, "Certificate of Conformance")
        ]

        wip_counts = {op[1]: 0 for op in operations}

        for component in components:
            serial = component.serial
            cast_code = component.cast_code
            heat_code = component.heat_code
            ht_batch = component.batch

            def has_passed_cnc(op_name):
                return CNCMachiningRecord.objects.filter(
                    heat_treatment=ht_batch,
                    op_desc=op_name,
                    determination="Pass"
                ).exists()


            def has_passed_ultrasonic(operation_type):
                return UltrasonicTest.objects.filter(
                    heat_treatment=ht_batch,
                    operation_type=operation_type,
                    sentence="Pass"
                ).exists()



            def has_passed(model):
                return model.objects.filter(heat_treatment=ht_batch).exists()

            def passed_certificate():
                return CertificateOfConformance.objects.filter(
                    cofccomponent__serial=serial,
                    cofccomponent__cast_code=cast_code,
                    cofccomponent__heat_code=heat_code
                ).exists()

            if not has_passed_cnc("Pre-machine Ogive"):
                wip_counts["Pre-machine Ogive"] += 1
                continue
            if not has_passed_cnc("Final Machine Ogive"):
                wip_counts["Final Machine Ogive"] += 1
                continue
            if not has_passed_ultrasonic("UT"):
                wip_counts["Ultrasonic"] += 1
                continue
            if not has_passed(StampingRecord):
                wip_counts["Stamping"] += 1
                continue
            if not has_passed(BandingRecord):
                wip_counts["Banding"] += 1
                continue
            if not has_passed_cnc("Nose Thread"):
                wip_counts["Nose Threads"] += 1
                continue
            if not has_passed_ultrasonic("MPI"):
                wip_counts["MPI"] += 1
                continue
            if not has_passed(FinalInspectionRecord):
                wip_counts["Final Inspection"] += 1
                continue
            if not passed_certificate():
                wip_counts["Certificate of Conformance"] += 1

        return Response(wip_counts, status=200)
