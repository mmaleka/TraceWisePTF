# heat_treatment/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('release/', views.release_batch, name='release_batch'),
    path('list/', views.list_batches, name='list_batches'),
]
