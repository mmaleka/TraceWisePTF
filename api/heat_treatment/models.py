# heat_treatment/models.py
from django.db import models
from api.product.models import Product
from django.contrib.auth.models import User

class HeatTreatmentBatch(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="heat_treatment_records")
    cast_code = models.CharField(max_length=20)
    heat_code = models.CharField(max_length=20)
    hard_shell = models.PositiveIntegerField()
    soft_shell = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()
    certificate = models.FileField(upload_to='certificates/', null=True, blank=True)
    released_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    released_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.product} - {self.cast_code} - {self.heat_code}"
