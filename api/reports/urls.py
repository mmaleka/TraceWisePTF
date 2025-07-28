# urls.py
from .views import WIPSummaryAPIView

urlpatterns = [
    path("wip-summary/", WIPSummaryAPIView.as_view(), name="wip-summary"),
]
