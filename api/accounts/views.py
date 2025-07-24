from rest_framework import viewsets
from .models import CustomUser
from .serializers import CustomUserSerializer
from rest_framework.permissions import IsAuthenticated

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAdminUser])
def reset_password(request):
    """
    Admin resets password for any user by username.
    {
        "username": "john",
        "new_password": "new12345"
    }
    """
    username = request.data.get("username")
    new_password = request.data.get("new_password")

    if not username or not new_password:
        return Response({"detail": "Username and new password are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()
        return Response({"detail": f"✅ Password for '{username}' has been reset."})
    except User.DoesNotExist:
        return Response({"detail": "❌ User not found."}, status=status.HTTP_404_NOT_FOUND)




class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
