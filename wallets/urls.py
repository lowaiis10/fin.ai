from django.urls import path
from .views import connect_wallet, save_wallet, homepage, dashboard, disconnect_wallet, fetch_prices, fetch_nfts

urlpatterns = [
    path("", homepage, name="homepage"),
    path("connect-wallet/", connect_wallet, name="connect_wallet"),
    path("save-wallet/", save_wallet, name="save_wallet"),
    path("dashboard/", dashboard, name="dashboard"),
    path("disconnect/", disconnect_wallet, name="disconnect_wallet"),
    path("fetch-prices/", fetch_prices, name="fetch_prices"),  # ✅ Fetch Prices API
    path("fetch-nfts/", fetch_nfts, name="fetch_nfts"),  # ✅ Fetch NFTs API
]
