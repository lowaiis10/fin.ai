from django.contrib import admin
from django.urls import path, include
from wallets.views import homepage, dashboard

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', homepage, name='homepage'),
    path('wallets/', include('wallets.urls')),
    path('dashboard/', dashboard, name='dashboard'),
]
