from rest_framework.routers import DefaultRouter
from .views import CertificateOfConformanceViewSet

router = DefaultRouter()
router.register(r'cofc', CertificateOfConformanceViewSet, basename='cofc')

urlpatterns = router.urls
