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




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from datetime import datetime

from api.heat_treatment.models import HTComponent, HeatTreatmentBatch
from api.stamping.models import Stamping
from api.cnc_machining.models import CNCMachiningRecord, CNCOperation
from api.ultrasonic.models import UltrasonicTest
from api.banding.models import Banding
# from api.balancing.models import BalancingComponent
from api.final_inspection.models import FinalInspectionRecord
from api.certificate.models import CofCComponent




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from datetime import datetime

from api.heat_treatment.models import HTComponent, HeatTreatmentBatch
from api.cnc_machining.models import CNCMachiningRecord, CNCOperation
from api.ultrasonic.models import UltrasonicTest  # For UT
from api.ultrasonic.models import UltrasonicTest as MPIModel  # Same model, different use
from api.final_inspection.models import FinalInspectionRecord

class ComponentTraceabilityReport(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        shell = request.query_params.get("shell")
        cast = request.query_params.get("cast")
        heat = request.query_params.get("heat")

        if not all([shell, cast, heat]):
            return Response({"detail": "Shell, Cast, and Heat are required."}, status=400)

        identifier = f"{shell}-{cast}-{heat}"

        # Utility to serialize components
        def serialize_queryset(queryset):
            return [
                {
                    "user": obj.performed_by.username if hasattr(obj, "performed_by") and obj.performed_by else (
                        obj.recorded_by.username if hasattr(obj, "recorded_by") and obj.recorded_by else "Unknown"
                    ),
                    "date": obj.performed_at.strftime("%Y-%m-%d") if hasattr(obj, "performed_at") and obj.performed_at else (
                        obj.date.strftime("%Y-%m-%d") if hasattr(obj, "date") and obj.date else ""
                    ),
                    "determination": getattr(obj, "determination", getattr(obj, "sentence", "N/A")),
                    "defect": getattr(obj, "defect", getattr(obj, "comment", ""))
                }
                for obj in queryset
            ]

        # Get Heat Treatment Batch
        ht_components = HTComponent.objects.filter(serial=shell, cast_code=cast, heat_code=heat)
        ht_batch = ht_components.first().batch if ht_components.exists() else None

        ht_data = {
            "product": ht_batch.product.name if ht_batch and hasattr(ht_batch, "product") else "",
            "quantity": ht_components.count(),
            "soft": ht_components.filter(determination="Soft").count(),
            "hard": ht_components.filter(determination="Accepted").count(),
            "records": serialize_queryset(ht_components)
        }

        # CNC Operations: Fetch all operations
        cnc_operations = CNCOperation.objects.all().order_by("operation_number")
        cnc_data = []

        if ht_batch:
            for op in cnc_operations:
                cnc_records = CNCMachiningRecord.objects.filter(
                    heat_treatment=ht_batch,
                    op_desc=op.name
                )
                if cnc_records.exists():
                    cnc_data.extend(serialize_queryset(cnc_records))

        # UT & MPI from shared model
        ut_records = UltrasonicTest.objects.filter(
            serial=shell,
            cast_code=cast,
            heat_code=heat,
            operation_type="UT"
        )

        mpi_records = MPIModel.objects.filter(
            serial=shell,
            cast_code=cast,
            heat_code=heat,
            operation_type="MPI"
        )

        data = {
            "heat_treatment": ht_data,
            "ultrasonic_testing": serialize_queryset(ut_records),
            "final_stamping": serialize_queryset(
                Stamping.objects.filter(shell=shell, cast=cast, heat=heat)
            ),
            "cnc_machining": cnc_data,
            "mpi": serialize_queryset(mpi_records),
            "banding": serialize_queryset(
                Banding.objects.filter(shell=shell, cast=cast, heat=heat)
            ),
            # "balancing": serialize_queryset(
            #     BalancingComponent.objects.filter(shell=shell, cast=cast, heat=heat)
            # ),
            "final_inspection": serialize_queryset(
                FinalInspectionRecord.objects.filter(shell=shell, cast=cast, heat=heat)
            ),
            "certificate_of_conformance": serialize_queryset(
                CofCComponent.objects.filter(shell=shell, cast=cast, heat=heat)
            ),
        }

        return Response(data)




class OperationFilterReport(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        operation = request.query_params.get("operation")
        start_date = request.query_params.get("start")
        end_date = request.query_params.get("end")

        if not operation or not start_date or not end_date:
            return Response({"detail": "Operation, start date, and end date are required."}, status=400)

        try:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=400)

        def serialize(obj, shell, cast, heat):
            return {
                "shell": shell,
                "cast": cast,
                "heat": heat,
                "user": getattr(obj, "performed_by", getattr(obj, "recorded_by", None)).username if getattr(obj, "performed_by", getattr(obj, "recorded_by", None)) else "Unknown",
                "date": getattr(obj, "performed_at", getattr(obj, "date", "")).strftime("%Y-%m-%d") if getattr(obj, "performed_at", getattr(obj, "date", None)) else "",
                "determination": getattr(obj, "determination", getattr(obj, "sentence", "N/A")),
                "defect": getattr(obj, "defect", getattr(obj, "comment", ""))
            }

        records = []

        if operation == "Heat Treatment":
            qs = HeatTreatmentBatch.objects.filter(released_at__range=(start, end))
            for obj in qs:
                records.append({
                    "shell": "-",
                    "cast": obj.cast_code,
                    "heat": obj.heat_code,
                    "user": obj.released_by.username if obj.released_by else "Unknown",
                    "date": obj.released_at.strftime("%Y-%m-%d"),
                    "determination": f"Hard: {obj.hard_shell}, Soft: {obj.soft_shell}",
                    "defect": ""
                })

        elif operation == "Ultrasonic Testing":
            qs = UltrasonicTest.objects.filter(operation_type="UT", date__range=(start, end))
            records = [serialize(obj, obj.serial, obj.cast_code, obj.heat_code) for obj in qs]

        elif operation == "Final Stamping":
            qs = Stamping.objects.filter(performed_at__range=(start, end))
            records = [serialize(obj, obj.shell, obj.cast, obj.heat) for obj in qs]

        elif operation == "CNC Machining":
            qs = CNCMachiningRecord.objects.filter(performed_at__range=(start, end))
            operation_map = {op.name: op.operation_number for op in CNCOperation.objects.all()}
            records = [
                {
                    **serialize(
                        obj,
                        getattr(obj.heat_treatment, "shell_number", "N/A") if obj.heat_treatment else "N/A",
                        getattr(obj.heat_treatment, "cast_code", "N/A") if obj.heat_treatment else "N/A",
                        getattr(obj.heat_treatment, "heat_code", "N/A") if obj.heat_treatment else "N/A"
                    ),
                    "operation": obj.op_desc,
                    "operation_number": operation_map.get(obj.op_desc, "Unknown")
                }
                for obj in qs
            ]

        elif operation == "MPI":
            qs = UltrasonicTest.objects.filter(operation_type="MPI", date__range=(start, end))
            records = [serialize(obj, obj.serial, obj.cast_code, obj.heat_code) for obj in qs]

        elif operation == "Banding":
            qs = Banding.objects.filter(performed_at__range=(start, end))
            records = [serialize(obj, obj.shell, obj.cast, obj.heat) for obj in qs]

        elif operation == "Balancing":
            qs = BalancingComponent.objects.filter(performed_at__range=(start, end))
            records = [serialize(obj, obj.shell, obj.cast, obj.heat) for obj in qs]

        elif operation == "Final Inspection":
            qs = FinalInspectionComponent.objects.filter(performed_at__range=(start, end))
            records = [serialize(obj, obj.shell, obj.cast, obj.heat) for obj in qs]

        elif operation == "Certificate of Conformance":
            qs = CofCComponent.objects.filter(performed_at__range=(start, end))
            records = [serialize(obj, obj.shell, obj.cast, obj.heat) for obj in qs]

        else:
            return Response({"detail": "Invalid operation selected."}, status=400)

        return Response(records)





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
