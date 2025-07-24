from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, reset_password

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('reset-password/', reset_password),
]


# Endpoint	Method	Description
# /api/users/	GET	🔍 List all users
# /api/users/	POST	➕ Create a new user
# /api/users/<id>/	GET	📄 Retrieve a user by ID
# /api/users/<id>/	PATCH	✏️ Partially update a user
# /api/users/<id>/	PUT	📝 Fully update a user
# /api/users/<id>/	DELETE	❌ Delete a user

# Method	URL	Description
# POST	/api/reset-password/	Reset user password