from django.contrib import admin
from django.urls import path, include
from wallets.views import homepage, dashboard

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', homepage, name='homepage'),
    path('dashboard/', dashboard, name='dashboard'),
    path('wallets/', include('wallets.urls')),
]
