# urls.py
from .views import WIPSummaryAPIView
from django.urls import path, include

from django.urls import path
from .views import OperationFilterReport, ComponentTraceabilityReport




urlpatterns = [
    path("wip-summary/", WIPSummaryAPIView.as_view(), name="wip-summary"),
    path("reports/filter-by-operation/", OperationFilterReport.as_view(), name="filter-by-operation"),
    path("reports/traceability/", ComponentTraceabilityReport.as_view(), name="component-traceability"),
]
