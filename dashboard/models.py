from django.db import models
from django.conf import settings

class UltrasonicTest(models.Model):
    SENTENCE_CHOICES = [
        ('Pass', 'Pass'),
        ('Rework', 'Rework'),
        ('Scrap', 'Scrap'),
    ]

    serial = models.CharField(max_length=50, unique=True)
    cast_code = models.CharField(max_length=50)
    heat_code = models.CharField(max_length=50)
    product = models.CharField(max_length=100)
    sentence = models.CharField(max_length=10, choices=SENTENCE_CHOICES)
    comment = models.TextField(blank=True)
    date = models.DateField(auto_now_add=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="ultrasonic_tests_dashboard")


    def __str__(self):
        return self.serial
