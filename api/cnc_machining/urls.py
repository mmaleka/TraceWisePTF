from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CNCOperationViewSet,                # ViewSet-based
    CNCMachiningListCreateView,         # Explicit CBV
    CNCMachiningRetrieveUpdateDestroyView
)

# DRF Router for the ViewSet
router = DefaultRouter()
router.register(r'cnc-operations', CNCOperationViewSet)

urlpatterns = [
    # ViewSet routes (handled automatically by the router)
    path('', include(router.urls)),

    # Explicit class-based views (separate custom endpoints)
    path('cnc-machining/', CNCMachiningListCreateView.as_view(), name='cnc-machining-list-create'),
    path('cnc-machining/<int:pk>/', CNCMachiningRetrieveUpdateDestroyView.as_view(), name='cnc-machining-detail'),
]







# GET /cnc-operations/ – List all
# POST /cnc-operations/ – Create
# GET /cnc-operations/<id>/ – Retrieve
# PUT/PATCH /cnc-operations/<id>/ – Update
# DELETE /cnc-operations/<id>/ – Delete

# /api/cnc-machining/	GET	List all records
# /api/cnc-machining/	POST	Create new record
# /api/cnc-machining/<id>/	GET	Retrieve a record
# /api/cnc-machining/<id>/	PUT	Update a record
# /api/cnc-machining/<id>/	PATCH	Partial update
# /api/cnc-machining/<id>/	DELETE	Delete a record