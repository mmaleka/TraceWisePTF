from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    CertificateOfConformanceViewSet,
    CofCComponentViewSet,
    VerifyCofCComponents,
)

# Register ViewSets with the router
router = DefaultRouter()
router.register(r'cofc', CertificateOfConformanceViewSet, basename='cofc')
router.register(r'components', CofCComponentViewSet, basename='components')

# Combine router and function-based endpoints
urlpatterns = router.urls + [
    path('verify/', VerifyCofCComponents.as_view(), name='verify-cofc-components'),
    
]






# GET	/api/components/	List components (filtered by ?certificate=1)
# POST	/api/components/	Add a new component
# GET	/api/components/:id/	Retrieve a specific component
# DELETE	/api/components/:id/	Delete a component
# PUT/PATCH	/api/components/:id/	Update a component (optional)


# ET /api/cofc/verify/?certificate=7
# {
#   "missing": {
#     "heat_treatment": ["SH-001-AA01-HT01"],
#     "UT": "All Complete",
#     "MPI": "All Complete",
#     "final_inspection": "All Complete"
#   },
#   "complete": false,
#   "quantity": 3
# }


