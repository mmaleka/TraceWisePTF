from django.urls import path
from .views import BandingListCreateView, BandingRetrieveUpdateDestroyView

urlpatterns = [
    path('', BandingListCreateView.as_view(), name='banding-list-create'),
    path('<int:pk>/', BandingRetrieveUpdateDestroyView.as_view(), name='banding-detail'),
]

# GET	/banding/	List all banding records
# POST	/banding/	Create a new banding record
# GET	/banding/<id>/	Retrieve a specific record by ID
# PUT	/banding/<id>/	Update a banding record
# PATCH	/banding/<id>/	Partially update a banding record
# DELETE	/banding/<id>/	Delete a banding record