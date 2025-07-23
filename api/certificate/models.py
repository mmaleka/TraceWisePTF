from django.db import models
from django.contrib.auth.models import User
from api.product.models import Product

class CertificateOfConformance(models.Model):
    coc_number = models.CharField(max_length=10, unique=True, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="certificates")
    comments = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=0)
    complete = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.coc_number:
            last = CertificateOfConformance.objects.order_by('-id').first()
            next_id = last.id + 1 if last else 1
            self.coc_number = str(next_id).zfill(4)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"CofC {self.coc_number} - {self.product.name}"
