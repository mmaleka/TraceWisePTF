from django.db import models
from django.conf import settings
from api.heat_treatment.models import HeatTreatmentBatch

class UltrasonicTest(models.Model):
    SENTENCE_CHOICES = [
        ('Pass', 'Pass'),
        ('Rework', 'Rework'),
        ('Scrap', 'Scrap'),
    ]

    OPERATION_CHOICES = [
        ('UT', 'UT'),
        ('MPI', 'MPI'),
    ]

    serial = models.CharField(max_length=50)
    cast_code = models.CharField(max_length=50)
    heat_code = models.CharField(max_length=50)

    heat_treatment = models.ForeignKey(HeatTreatmentBatch, on_delete=models.SET_NULL, null=True, blank=True, related_name="ultrasonic_records")
    
    operation_type = models.CharField(max_length=10, choices=OPERATION_CHOICES, null=True)

    sentence = models.CharField(max_length=10, choices=SENTENCE_CHOICES)
    comment = models.TextField(blank=True)
    date = models.DateField(auto_now_add=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="ultrasonic_tests_api")


    def __str__(self):
        return f"{self.serial} - {self.cast_code} - {self.heat_code}"
