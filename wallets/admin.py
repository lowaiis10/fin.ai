from django.contrib import admin
from .models import Wallet

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('address', 'wallet_type', 'created_at')
    search_fields = ('address', 'wallet_type')
