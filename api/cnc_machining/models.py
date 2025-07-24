from django.db import models
from django.conf import settings
from api.heat_treatment.models import HeatTreatmentBatch

class CNCMachiningRecord(models.Model):
    heat_treatment = models.ForeignKey(HeatTreatmentBatch, on_delete=models.SET_NULL, null=True, blank=True, related_name="cnc_records")
    op_desc = models.CharField(max_length=100)
    op_no = models.CharField(max_length=50)
    machine_no = models.CharField(max_length=50)
    determination = models.CharField(max_length=20, choices=[("Pass", "Pass"), ("Rework", "Rework"), ("Scrap", "Scrap")])
    comments = models.TextField(blank=True, default="-")
    shift = models.CharField(max_length=10)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    date_recorded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product} - {self.op_desc} ({self.determination})"

class CNCOperation(models.Model):
    name = models.CharField(max_length=100)
    operation_number = models.IntegerField()

    def __str__(self):
        return f"{self.operation_number} - {self.name}"
