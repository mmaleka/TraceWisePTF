from django.urls import path
from .views import StampingListCreateView, StampingRetrieveUpdateDestroyView

urlpatterns = [
    path('', StampingListCreateView.as_view(), name='stamping-list-create'),
    path('<int:pk>/', StampingRetrieveUpdateDestroyView.as_view(), name='stamping-detail'),
]

# GET /api/stamping/ — list all

# POST /api/stamping/ — create a new record

# GET /api/stamping/<id>/ — get details

# PUT/PATCH /api/stamping/<id>/ — update

# DELETE /api/stamping/<id>/ — delete
