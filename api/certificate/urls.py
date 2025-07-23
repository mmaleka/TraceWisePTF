from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    CertificateOfConformanceViewSet,
    CofCComponentViewSet,
    VerifyCofCComponents
)

# Register ViewSets with the router
router = DefaultRouter()
router.register(r'cofc', CertificateOfConformanceViewSet, basename='cofc')
router.register(r'components', CofCComponentViewSet, basename='components')

# Combine router and function-based endpoints
urlpatterns = router.urls + [
    path('cofc/verify/', VerifyCofCComponents.as_view(), name='verify-cofc-components'),
]




# GET	/api/components/	List components (filtered by ?certificate=1)
# POST	/api/components/	Add a new component
# GET	/api/components/:id/	Retrieve a specific component
# DELETE	/api/components/:id/	Delete a component
# PUT/PATCH	/api/components/:id/	Update a component (optional)

# ET /api/cofc/verify/?certificate=7



