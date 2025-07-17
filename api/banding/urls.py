from django.urls import path
from .views import BandingListCreateView, BandingRetrieveUpdateDestroyView

urlpatterns = [
    path('', BandingListCreateView.as_view(), name='banding-list-create'),
    path('<int:pk>/', BandingRetrieveUpdateDestroyView.as_view(), name='banding-detail'),
]
