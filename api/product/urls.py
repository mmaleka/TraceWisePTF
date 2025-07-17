from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]

# GET /api/products/ – List all

# POST /api/products/ – Create new

# GET /api/products/<id>/ – Retrieve one

# PUT/PATCH /api/products/<id>/ – Update

# DELETE /api/products/<id>/ – Delete