from django.urls import path, include
from .views import whoami
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("whoami/", whoami, name="whoami"),

    # Heat Treatment endpoints
    path("heat-treatment/", include("api.heat_treatment.urls")),
    path('ultrasonic/', include('api.ultrasonic.urls')),
    path("products/", include("api.product.urls")),
    path("stamping/", include("api.stamping.urls")),
    path("cnc_machining/", include("api.cnc_machining.urls")),
    path('banding/', include('api.banding.urls')),
    path('final_inspection/', include('api.final_inspection.urls')),
    path('certificate/', include('api.certificate.urls')),
    path('accounts/', include('api.accounts.urls')),
]
