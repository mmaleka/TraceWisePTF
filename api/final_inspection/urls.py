from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FinalInspectionRecordViewSet

router = DefaultRouter()
router.register(r'final-inspection', FinalInspectionRecordViewSet, basename='final-inspection')

urlpatterns = [
    path('', include(router.urls)),
]

# Method	URL Path	Action
# GET	/api/inspection/final-inspection/	List all inspection records
# POST	/api/inspection/final-inspection/	Create one or more records
# GET	/api/inspection/final-inspection/<id>/	Retrieve a specific record
# PUT	/api/inspection/final-inspection/<id>/	Update a record
# DELETE	/api/inspection/final-inspection/<id>/	Delete a record