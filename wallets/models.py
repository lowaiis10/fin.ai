from django.db import models

# Create your models here.
from django.db import models

class Wallet(models.Model):
    address = models.CharField(max_length=255, unique=True)
    wallet_type = models.CharField(max_length=10, choices=[('metamask', 'Metamask'), ('phantom', 'Phantom')])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.wallet_type} - {self.address}"
