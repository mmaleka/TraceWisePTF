from django.db import models
from django.conf import settings
from api.heat_treatment.models import HeatTreatmentBatch

class Banding(models.Model):
    heat_treatment = models.ForeignKey(HeatTreatmentBatch, on_delete=models.SET_NULL, null=True, blank=True, related_name="banding_records")
    serial = models.CharField(max_length=100)
    cast_code = models.CharField(max_length=100)
    heat_code = models.CharField(max_length=100)
    pressure = models.DecimalField(max_digits=10, decimal_places=5)
    gap = models.DecimalField(max_digits=10, decimal_places=5)
    diameter = models.DecimalField(max_digits=10, decimal_places=5)
    image = models.ImageField(upload_to='banding_images/', null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.serial} - {self.cast_code} - {self.heat_code}"
