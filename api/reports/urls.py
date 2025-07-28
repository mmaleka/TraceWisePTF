# urls.py
from .views import WIPSummaryAPIView
from django.urls import path, include

urlpatterns = [
    path("wip-summary/", WIPSummaryAPIView.as_view(), name="wip-summary"),
]
