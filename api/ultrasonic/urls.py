from django.urls import path
from .views import (
    UltrasonicTestListCreateView,
    UltrasonicTestRetrieveUpdateDestroyView
)


urlpatterns = [
    path('records/', UltrasonicTestListCreateView.as_view(), name='ut-records'),
    path('<int:pk>/', UltrasonicTestRetrieveUpdateDestroyView.as_view(), name='ultrasonic-detail'),
]

# GET /api/ultrasonic/ – list all UT records

# POST /api/ultrasonic/ – create a new record

# GET /api/ultrasonic/<id>/ – view a single record

# PUT /api/ultrasonic/<id>/ – full update

# PATCH /api/ultrasonic/<id>/ – partial update

# DELETE /api/ultrasonic/<id>/ – delete record