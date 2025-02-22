# wallets/urls.py
from django.urls import path
from .views import (
    homepage,
    overview,
    crypto_allocation,
    nft,
    disconnect_wallet,
    fetch_prices,
    fetch_nfts,
    save_wallet
)

urlpatterns = [
    # Endpoints for wallet functionality
    path('disconnect/', disconnect_wallet, name='disconnect_wallet'),
    path('fetch_prices/', fetch_prices, name='fetch_prices'),
    path('fetch_nfts/', fetch_nfts, name='fetch_nfts'),
    path('save-wallet/', save_wallet, name='save_wallet'),

    # If you want to keep separate pages:
    path('crypto-allocation/', crypto_allocation, name='crypto_allocation'),
    path('nft/', nft, name='nft'),
]
