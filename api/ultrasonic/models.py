from django.db import models
from django.contrib.auth.models import User
from api.heat_treatment.models import HeatTreatmentBatch

class UltrasonicTest(models.Model):
    SENTENCE_CHOICES = [
        ('Pass', 'Pass'),
        ('Rework', 'Rework'),
        ('Scrap', 'Scrap'),
    ]

    serial = models.CharField(max_length=50, unique=True)
    cast_code = models.CharField(max_length=50)
    heat_code = models.CharField(max_length=50)

    heat_treatment = models.ForeignKey(HeatTreatmentBatch, on_delete=models.SET_NULL, null=True, blank=True, related_name="ultrasonic_records")
    
    sentence = models.CharField(max_length=10, choices=SENTENCE_CHOICES)
    comment = models.TextField(blank=True)
    date = models.DateField(auto_now_add=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="ultrasonic_tests_api")


    def __str__(self):
        return self.serial
