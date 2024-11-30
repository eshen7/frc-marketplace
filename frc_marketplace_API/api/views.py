import json
from django.forms import ValidationError
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from .models import User, Part, PartRequest
from .serializers import UserSerializer, PartSerializer, PartRequestSerializer
from rest_framework.permissions import IsAuthenticated


# Create your views here.
@api_view(["GET", "POST"])
def user_views(request):
    """views for GETTING and CREATING users"""
    if request.method == "GET":
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "POST":
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response(
                {"message": "Validation failed", "errors": e.detail},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"message": "Registration failed", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
@permission_classes([IsAuthenticated])
@api_view(["GET", "PUT"])
def get_logged_in_user_view(request):
    """
    View to fetch the currently logged-in user's data.
    """
    try:
        # Get the logged-in user from the request
        user = request.user

        if request.method == "GET":
            # Serialize the user's data
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        if request.method == "PUT":
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    except Exception as e:
        return Response(
            {"message": "An error occurred", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    
@permission_classes([IsAuthenticated])
@api_view(["PUT"])
def change_password_view(request):
    """
    Allow the authenticated user to change their password.
    """
    user = request.user
    data = request.data

    current_password = data.get("current")
    new_password = data.get("new")
    confirm_password = data.get("confirmation")

    # Check if the current password is correct
    if not user.check_password(current_password):
        return Response({"error": "Current password is incorrect."}, status=400)

    # Check if new passwords match
    if new_password != confirm_password:
        return Response({"error": "New passwords do not match."}, status=400)
    
    if current_password == new_password:
        return Response({"error": "New password cannot be the same as the current password."}, status=400)

    try:
        # Update the user's password
        user.set_password(new_password)
        user.save()

        login(request, user, backend='django.contrib.auth.backends.ModelBackend')

        return Response({"message": "Password changed successfully."}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@permission_classes([IsAuthenticated])
@api_view(["DELETE"])
def delete_user_view(request):
    """
    Allow the authenticated user to delete their account.
    """
    try:
        user = request.user
        user.delete()  # Delete the user
        logout(request)  # Log the user out
        return Response({"message": "Account deleted successfully."}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def login_view(request):
    if request.method == "POST":
        data = request.data
        email = data.get("email")
        password = data.get("password")

        user = authenticate(request, email=email, password=password)
        if user:
            login(request, user)
            uuid_to_set = str(user.UUID)
            response = JsonResponse(
                {
                    "message": "Login successful",
                    "username": user.email,
                },
                status=200,
            )
            response.set_cookie(
                "user_uuid",
                uuid_to_set,
                httponly=False,
                samesite="Lax",
                path="/",
            )
            return response
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=400)
    return JsonResponse({"error": "Only POST requests are allowed"}, status=405)


@api_view(["POST"])
def logout_view(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({"message": "Successfully logged out"}, status=200)
    return JsonResponse({"error": "Only POST requests are allowed"}, status=405)


@api_view(["GET", "POST"])
def part_views(request):
    """Views for GETTING and CREATING Parts."""
    if request.method == "GET":
        parts = Part.objects.all()
        serializer = PartSerializer(parts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == "POST":
        serializer = PartSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Save the new part to the database
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
@api_view(["GET", "POST"])
def part_request_views(request):
    """Views for GETTING and CREATING Part Requests."""
    if request.method == "GET":
        part_requests = PartRequest.objects.all()
        serializer = PartRequestSerializer(part_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "POST":
        user_uuid = request.headers.get("X-User-UUID")
        user_csrftoken = request.headers.get("X-CSRFToken")
        try:
            user = User.objects.get(UUID=user_uuid)
        except User.DoesNotExist:
            return Response(
                {"message": f"User with UUID {user_uuid} not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"message": "An error occurred", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = PartRequestSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
