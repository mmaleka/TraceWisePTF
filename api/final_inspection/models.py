from django.db import models
from django.contrib.auth.models import User
from api.heat_treatment.models import HeatTreatmentBatch

class FinalInspectionRecord(models.Model):
    heat_treatment = models.ForeignKey(
        HeatTreatmentBatch, on_delete=models.SET_NULL, null=True, blank=True, related_name="inspection_records"
    )
    serial = models.CharField(max_length=100)
    cast_code = models.CharField(max_length=100)
    heat_code = models.CharField(max_length=100)

    inspector = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    determination = models.CharField(
        max_length=20,
        choices=[("Pass", "Pass"), ("Rework", "Rework"), ("Scrap", "Scrap")],
        blank=True
    )
    defects = models.TextField(blank=True, default="")
    date = models.DateTimeField(auto_now_add=True)

    # Optional dimensions
    dim_1 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dim_2 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dim_3 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dim_4 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dim_5 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dim_6 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dim_7 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dim_8 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dim_9 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dim_10 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.serial} - {self.cast_code} - {self.heat_code}"
