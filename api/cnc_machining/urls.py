from django.urls import path
from .views import (
    CNCMachiningListCreateView,
    CNCMachiningRetrieveUpdateDestroyView,
)

urlpatterns = [
    path('', CNCMachiningListCreateView.as_view(), name='cnc-machining-list-create'),
    path('<int:pk>/', CNCMachiningRetrieveUpdateDestroyView.as_view(), name='cnc-machining-detail'),
]

# /api/cnc-machining/	GET	List all records
# /api/cnc-machining/	POST	Create new record
# /api/cnc-machining/<id>/	GET	Retrieve a record
# /api/cnc-machining/<id>/	PUT	Update a record
# /api/cnc-machining/<id>/	PATCH	Partial update
# /api/cnc-machining/<id>/	DELETE	Delete a record