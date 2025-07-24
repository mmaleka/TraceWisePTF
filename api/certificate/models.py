from django.db import models
from django.conf import settings
from api.product.models import Product

class CertificateOfConformance(models.Model):
    coc_number = models.CharField(max_length=10, unique=True, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="certificates")
    comments = models.TextField(blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=0)
    complete = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    final_inspection = models.CharField(max_length=50, blank=True, null=True)
    mpi = models.CharField(max_length=50, blank=True, null=True)
    ut = models.CharField(max_length=50, blank=True, null=True)
    heat_treatment = models.CharField(max_length=50, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.coc_number:
            last = CertificateOfConformance.objects.order_by('-id').first()
            next_id = last.id + 1 if last else 1
            self.coc_number = str(next_id).zfill(4)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"CofC {self.coc_number} - {self.product.name}"



class CofCComponent(models.Model):
    certificate = models.ForeignKey(CertificateOfConformance, on_delete=models.CASCADE, related_name="components")
    serial = models.CharField(max_length=50)
    cast_code = models.CharField(max_length=50)
    heat_code = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.serial} ({self.cast_code} / {self.heat_code})"