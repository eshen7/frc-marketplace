import json
from django.forms import ValidationError
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from .models import (
    PartSale,
    User,
    Part,
    PartRequest,
    Message,
    PartCategory,
    PartManufacturer,
)
from .serializers import (
    MessageSerializer,
    PartSaleSerializer,
    UserSerializer,
    PartSerializer,
    PartRequestSerializer,
    PartCategorySerializer,
    PartManufacturerSerializer,
)
from rest_framework.permissions import IsAuthenticated
from django.db import models
from django.core.paginator import Paginator
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from .tasks import send_email_task


@api_view(["GET"])
def search_all_view(request):
    """View for searching EVERYTHING"""
    if request.method == "GET":
        total_data = {}
        users = User.objects.all()
        parts = Part.objects.all()
        requests = PartRequest.objects.all()
        user_serializer = UserSerializer(users, many=True)
        part_serializer = PartSerializer(parts, many=True)
        request_serializer = PartRequestSerializer(requests, many=True)

        total_data["users"] = user_serializer.data
        total_data["parts"] = part_serializer.data
        total_data["requests"] = request_serializer.data
        return Response(total_data, status=status.HTTP_200_OK)
    return JsonResponse({"error": "Only GET requests are allowed"}, status=405)


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


@api_view(["GET"])
def user_by_team_number_view(request, team_number):
    """Fetch a specific user's details by UUID."""
    try:
        user = User.objects.get(team_number=team_number)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {"error": "User frc{team_number} not found"},
            status=status.HTTP_404_NOT_FOUND,
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
        return Response(
            {"error": "New password cannot be the same as the current password."},
            status=400,
        )

    try:
        # Update the user's password
        user.set_password(new_password)
        user.save()

        login(request, user, backend="django.contrib.auth.backends.ModelBackend")

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
def manufacturer_view(request):
    """GET/POST for part manufacturers."""
    if request.method == "GET":
        manufacturers = PartManufacturer.objects.all()
        serializer = PartManufacturerSerializer(manufacturers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == "POST":
        serializer = PartManufacturerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(request.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
def category_view(request):
    """GET/POST for part categories."""
    if request.method == "GET":
        categories = PartCategory.objects.all()
        serializer = PartCategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == "POST":
        serializer = PartCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(request.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
            serializer.save()
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


@api_view(["GET"])
def request_view(request, request_id):
    """Fetch a specific request's details by UUID."""
    try:
        part_request = PartRequest.objects.get(id=request_id)
        serializer = PartRequestSerializer(part_request)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except PartRequest.DoesNotExist:
        return Response(
            {"error": "Part Request not found"}, status=status.HTTP_404_NOT_FOUND
        )
    
@api_view(["GET"])
def part_view(part, part_id):
    """Fetch a specific part's details by UUID."""
    try:
        part = Part.objects.get(id=part_id)
        serializer = PartSerializer(part)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except PartRequest.DoesNotExist:
        return Response(
            {"error": "Part not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET"])
def requests_by_user_view(request, team_number):
    """Fetch all requests by a user."""
    try:
        # Fetch the user by team_number
        user = User.objects.get(team_number=team_number)
    except User.DoesNotExist:
        return Response(
            {"error": f"User with team number {team_number} not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    part_request = PartRequest.objects.filter(user_id=user)
    serializer = PartRequestSerializer(part_request, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
def part_sale_views(request):
    """Method for GETTING and CREATING Part Sales."""
    if request.method == "GET":
        part_sales = PartSale.objects.all()
        serializer = PartSaleSerializer(part_sales, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == "POST":
        serializer = PartSaleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return JsonResponse({"error": "Only GET and POST requests are allowed"}, status=405)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def messages_by_user_get_view(request, team_number):
    """
    View for handling direct messages (DMs):
    - GET: Retrieve messages between the logged-in user and a specific user.
    """

    limit = int(request.query_params.get("limit", 25))  # Default to 25
    offset = int(request.query_params.get("offset", 0))  # Default to 0

    # Fetch messages between the logged-in user and another user
    try:
        receiver = User.objects.get(team_number=team_number)
    except User.DoesNotExist:
        return Response(
            {"error": f"User with # {team_number} not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    sender = request.user

    # Retrieve messages sent between the logged-in user and the other user
    messages = Message.objects.filter(
        (models.Q(sender=sender) & models.Q(receiver=receiver))
        | (models.Q(sender=receiver) & models.Q(receiver=sender))
    ).order_by("-timestamp")
    paginator = Paginator(messages, limit)
    paginated_messages = (
        paginator.page(1) if offset == 0 else paginator.page(offset // limit + 1)
    )

    serializer = MessageSerializer(paginated_messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def message_by_id_get_view(request, message_id):
    """
    View for handling direct messages (DMs):
    - GET: Retrieve messages between the logged-in user and a specific user.
    """
    # Fetch messages between the logged-in user and another user
    try:
        message = Message.objects.get(id=message_id)
    except User.DoesNotExist:
        return Response(
            {"error": f"Message with # {message_id} not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    sender = request.user

    if sender == message.sender or sender == message.receiver:
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": f"User not validated"}, status=status.HTTP_401_UNAUTHORIZED
        )


@permission_classes([IsAuthenticated])
@api_view(["POST"])
def message_post_view(request):
    """
    View for handling direct messages (DMs):
    - POST: Send a new direct message.
    """
    # Send a new direct message
    data = request.data
    message_id = data.get("id")
    message = data.get("message")
    sender = request.user
    receiver_team_number = data.get("receiver")

    if Message.objects.filter(id=message_id).exists():
        return JsonResponse(
            {"detail": "Message already exists"}, status=status.HTTP_200_OK
        )

    if not (message and sender and receiver_team_number):
        return Response(
            {"error": "Missing 'id', 'message', 'sender', or 'receiver'."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Fetch sender and receiver users from the provided JSON data
        receiver = User.objects.get(team_number=receiver_team_number)

        # Create a new message instance with the provided ID
        message = Message.objects.create(
            id=message_id,
            sender=sender,
            receiver=receiver,
            message=message,
        )

        # Use Celery to send the email asynchronously
        if receiver.email:
            send_email_task.delay(
                subject=f"New Message from {sender.team_number}",
                message=f"Hello {receiver.full_name},\n\nYou have received a new message from {sender.full_name} on team {sender.team_number}:\n\n{message.message}\n\n- FRC Marketplace Team",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[receiver.email],
            )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response(
            {"error": "Sender or receiver not found."}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
