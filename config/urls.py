from django.contrib import admin
from django.urls import path, include
from wallets.views import homepage, overview

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', homepage, name='homepage'),  # Landing page
    path('overview/', overview, name='overview'),  # Main dashboard page
    path('wallets/', include('wallets.urls')),
]
