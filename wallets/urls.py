from django.urls import path
from .views import (
    homepage, overview, disconnect_wallet, 
    fetch_prices, fetch_nfts, save_wallet
)

urlpatterns = [
    path('disconnect/', disconnect_wallet, name='disconnect_wallet'),
    path('fetch_prices/', fetch_prices, name='fetch_prices'),
    path('fetch_nfts/', fetch_nfts, name='fetch_nfts'),
    path('save-wallet/', save_wallet, name='save_wallet'),
]
