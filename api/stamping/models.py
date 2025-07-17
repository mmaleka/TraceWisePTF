from django.db import models
from django.contrib.auth.models import User
from api.heat_treatment.models import HeatTreatmentBatch

class Stamping(models.Model):
    serial = models.CharField(max_length=100, unique=True)
    cast_code = models.CharField(max_length=100)
    heat_code = models.CharField(max_length=100)
    
    heat_treatment = models.ForeignKey(HeatTreatmentBatch, on_delete=models.SET_NULL, null=True, blank=True, related_name="stamping_records")

    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="stamping_records")
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.serial
