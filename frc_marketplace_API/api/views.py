import json
from django.forms import ValidationError
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db.utils import IntegrityError
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
    PublicUserSerializer,
    PartSerializer,
    PartRequestSerializer,
    PartCategorySerializer,
    PartManufacturerSerializer,
)
from rest_framework.permissions import IsAuthenticated
from django.db import models
from django.core.paginator import Paginator, EmptyPage
from django.conf import settings
from django.shortcuts import get_object_or_404
from .tasks import send_email_task, send_dm_notification, send_daily_requests_digest, send_welcome_email, send_password_reset_email
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str  # use force_str instead of force_text in newer Django versions
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from uuid import UUID
from django.utils import timezone  # Add this import

class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return str(obj)
        return super().default(obj)


@api_view(["GET"])
def search_all_view(request):
    """View for searching EVERYTHING"""
    if request.method == "GET":
        total_data = {}
        users = User.objects.all()
        parts = Part.objects.all()
        requests = PartRequest.objects.all()
        sales = PartSale.objects.all()
        
        user_serializer = PublicUserSerializer(users, many=True)
        # Filter out any null users from the serialized data
        filtered_users = [user for user in user_serializer.data if user is not None]
        
        part_serializer = PartSerializer(parts, many=True)
        request_serializer = PartRequestSerializer(requests, many=True)
        sale_serializer = PartSaleSerializer(sales, many=True)

        total_data["users"] = filtered_users
        total_data["parts"] = part_serializer.data
        total_data["requests"] = request_serializer.data
        total_data["sales"] = sale_serializer.data
        return Response(total_data, status=status.HTTP_200_OK)
    return JsonResponse({"error": "Only GET requests are allowed"}, status=405)


# Create your views here.
@api_view(["GET", "POST"])
def user_views(request):
    """views for GETTING and CREATING users"""
    if request.method == "GET":
        users = User.objects.all()
        serializer = PublicUserSerializer(users, many=True)
        # Filter out any null users from the serialized data
        filtered_users = [user for user in serializer.data if user is not None]
        return Response(filtered_users, status=status.HTTP_200_OK)

    if request.method == "POST":
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                send_welcome_email.delay(serializer.data.get("email"))
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
    """Fetch a specific user's details by id."""
    try:
        user = User.objects.get(team_number=team_number)
        serializer = PublicUserSerializer(user)
        # Check if serialized user is null
        if serializer.data is None:
            return Response(
                {"error": f"User data for team {team_number} is invalid"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {"error": f"User frc{team_number} not found"},
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
            if isinstance(user, User):
                return Response(serializer.data, status=status.HTTP_200_OK)
            else: 
                logout(request)
                response = JsonResponse({"message": "User not found, logging out."}, status=status.HTTP_404_NOT_FOUND)
                response.delete_cookie(
                        "user_id",
                        path="/",
                    )
                return response
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
        is_active = False
        try:
            user = User.objects.get(email=email)
            is_active = user.is_active
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "User with that email not found"}, status=404
            )
        authenticated = authenticate(request, email=email, password=password)

        if authenticated and is_active:
            login(request, authenticated)
            id_to_set = str(user.id)
            response = JsonResponse(
                {
                    "message": "Login successful",
                    "username": user.email,
                },
                status=200,
            )
            response.set_cookie(
                "user_id",
                id_to_set,
                httponly=False,
                samesite="Lax",
                path="/",
            )
            return response
        elif not is_active:
            return JsonResponse(
            {"error": "Account is not active. Please wait until your account has been approved!"},
                status=403,
            )
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=400)
    return JsonResponse({"error": "Only POST requests are allowed"}, status=405)


@api_view(["POST"])
def logout_view(request):
    if request.method == "POST":
        logout(request)
        response = JsonResponse({"message": "Successfully logged out"}, status=200)
        response.delete_cookie(
                "user_id",
                path="/",
            )
        return response
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
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            if "unique" in str(serializer.errors):
                return Response(
                    {"error": "Integrity Error: Part already exists."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
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
        user_id = request.headers.get("X-User-ID")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"message": f"User with id {user_id} not found"},
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
            new_request = serializer.save(user=user)
            
            # Convert serializer data to JSON-safe format
            serialized_data = json.loads(
                json.dumps(serializer.data, cls=UUIDEncoder)
            )
            
            # Get the channel layer and send WebSocket updates
            channel_layer = get_channel_layer()
            
            # Send to the user's personal channel with correct type
            async_to_sync(channel_layer.group_send)(
                f"user_{user.team_number}",
                {
                    "type": "request.created",
                    "request": serialized_data
                }
            )
            
            # If request is for a competition, send to event channel
            if new_request.event_key:
                async_to_sync(channel_layer.group_send)(
                    f"event_{new_request.event_key}",
                    {
                        "type": "event.update",
                        "message": {
                            "type": "new_request",
                            "request": serialized_data
                        }
                    }
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def request_view(request, request_id):
    """Fetch a specific request's details by id."""
    try:
        part_request = PartRequest.objects.get(id=request_id)
        serializer = PartRequestSerializer(part_request)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except PartRequest.DoesNotExist:
        return Response(
            {"error": "Part Request not found"}, status=status.HTTP_404_NOT_FOUND
        )

@permission_classes([IsAuthenticated])
@api_view(["PUT"])
def request_edit_view(request, request_id):
    """Edit a specific request's details by id."""
    try:
        data = request.data
        quantity = data.get("quantity").get("val")
        needed_date = data.get("needed_date").get("val")
        additional_info = data.get("additional_info").get("val")

        part_request = PartRequest.objects.get(id=request_id)
        part_request.quantity = quantity
        part_request.needed_date = needed_date
        part_request.additional_info = additional_info
        part_request.save()
        serializer = PartRequestSerializer(part_request)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except PartRequest.DoesNotExist:
        return Response(
            {"error": "Part Request not found"}, status=status.HTTP_404_NOT_FOUND
        )

@permission_classes([IsAuthenticated])
@api_view(["DELETE"])
def delete_request_view(request, request_id):
    """
    Allow the authenticated user to delete a request.
    """
    try:
        user = request.user
        part_request = PartRequest.objects.get(id=request_id)
        if part_request.user.team_number != user.team_number:
            return Response({"error": "You are not authorized to delete this request."}, status=403)
        part_request.delete()
        return Response({"message": "Request deleted successfully."}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["GET"])
def sale_view(request, sale_id):
    """Fetch a specific sale's details by id."""
    try:
        part_sale = PartSale.objects.get(id=sale_id)
        serializer = PartSaleSerializer(part_sale)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except PartSale.DoesNotExist:
        return Response(
            {"error": "Part Sale not found"}, status=status.HTTP_404_NOT_FOUND
        )

@permission_classes([IsAuthenticated])
@api_view(["PUT"])
def sale_edit_view(request, sale_id):
    """Edit a specific sale's details by id."""
    try:
        data = request.data
        quantity = data.get("quantity").get("val")
        ask_price = data.get("ask_price").get("val")
        condition = data.get("condition").get("val")
        additional_info = data.get("additional_info").get("val")

        part_sale = PartSale.objects.get(id=sale_id)
        part_sale.quantity = quantity
        part_sale.ask_price = ask_price
        part_sale.condition = condition
        part_sale.additional_info = additional_info
        part_sale.save()
        serializer = PartSaleSerializer(part_sale)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except PartSale.DoesNotExist:
        return Response(
            {"error": "Part Sale not found"}, status=status.HTTP_404_NOT_FOUND
        )

@permission_classes([IsAuthenticated])
@api_view(["DELETE"])
def delete_sale_view(request, sale_id):
    """
    Allow the authenticated user to delete a sale.
    """
    try:
        user = request.user
        part_sale = PartSale.objects.get(id=sale_id)
        if part_sale.user.team_number != user.team_number:
            return Response({"error": "You are not authorized to delete this sale."}, status=403)
        part_sale.delete()
        return Response({"message": "Sale deleted successfully."}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
def part_view(part, part_id):
    """Fetch a specific part's details by id."""
    try:
        part = Part.objects.get(id=part_id)
        serializer = PartSerializer(part)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Part.DoesNotExist:
        return Response({"error": "Part not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
def requests_by_part_view(part, part_id):
    """Fetch all of specific part's requests."""
    try:
        part = Part.objects.get(id=part_id)
        requests_for_part = PartRequest.objects.filter(part=part)
        serializer = PartRequestSerializer(requests_for_part, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Part.DoesNotExist:
        return Response(
            {"error": "Part requests not found"}, status=status.HTTP_404_NOT_FOUND
        )

@api_view(["GET"])
def sales_by_part_view(part, part_id):
    """Fetch all of specific part's sales."""
    try:
        part = Part.objects.get(id=part_id)
        sales_for_part = PartSale.objects.filter(part=part)
        serializer = PartSaleSerializer(sales_for_part, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Part.DoesNotExist:
        return Response(
            {"error": "Part sales not found"}, status=status.HTTP_404_NOT_FOUND
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

@api_view(["GET"])
def sales_by_user_view(request, team_number):
    """Fetch all sales by a user."""
    try:
        # Fetch the user by team_number
        user = User.objects.get(team_number=team_number)
    except User.DoesNotExist:
        return Response(
            {"error": f"User with team number {team_number} not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    part_sale = PartSale.objects.filter(user_id=user)
    serializer = PartSaleSerializer(part_sale, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
def part_sale_views(request):
    """Method for GETTING and CREATING Part Sales."""
    if request.method == "GET":
        part_sales = PartSale.objects.all()
        serializer = PartSaleSerializer(part_sales, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == "POST":
        user_id = request.headers.get("X-User-ID")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"message": f"User with id {user_id} not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"message": "An error occurred", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        serializer = PartSaleSerializer(data=request.data, context={"sale": request})
        if serializer.is_valid():
            serializer.save(user=user)
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
    limit = int(request.query_params.get("limit", 25))
    offset = int(request.query_params.get("offset", 0))

    try:
        receiver = User.objects.get(team_number=team_number)
    except User.DoesNotExist:
        return Response(
            {"error": f"User with # {team_number} not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    sender = request.user
    messages = Message.objects.filter(
        (models.Q(sender=sender) & models.Q(receiver=receiver))
        | (models.Q(sender=receiver) & models.Q(receiver=sender))
    ).order_by("-timestamp")

    paginator = Paginator(messages, limit)
    
    try:
        page_number = offset // limit + 1
        paginated_messages = paginator.page(page_number)
    except EmptyPage:
        return Response([], status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": f"Pagination error: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
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
@api_view(["GET"])
def dm_list_view(request):
    """
    Get the list of unique users the current user has messaged with, ordered by most recent message.
    """
    try:
        user = request.user.id

        # Fetch conversations (users who have sent or received messages with the current user)
        conversations = (
            Message.objects.filter(models.Q(sender=user) | models.Q(receiver=user))
            .values("sender", "receiver")
            .annotate(most_recent=models.Max("timestamp"))
        )

        # Collect unique user IDs
        user_ids = set()
        for convo in conversations:
            user_ids.add(convo["sender"])
            user_ids.add(convo["receiver"])
        user_ids.discard(user)  # Exclude the current user

        # Prepare data for response
        user_data = []
        for uid in user_ids:
            # Fetch the most recent message for this conversation
            recent_message = (
                Message.objects.filter(
                    (
                        models.Q(sender=user, receiver_id=uid)
                        | models.Q(sender_id=uid, receiver=user)
                    )
                )
                .order_by("-timestamp")
                .first()
            )

            # Include relevant user and message data
            user_data.append(
                {
                    "team_number": (
                        recent_message.sender.team_number
                        if recent_message.sender.id == uid
                        else recent_message.receiver.team_number
                    ),
                    "team_name": (
                        recent_message.sender.team_name
                        if recent_message.sender.id == uid
                        else recent_message.receiver.team_name
                    ),
                    "full_name": (
                        recent_message.sender.full_name
                        if recent_message.sender.id == uid
                        else recent_message.receiver.full_name
                    ),
                    "most_recent_message": recent_message.message,
                    "receiver": recent_message.receiver.team_number,
                    "timestamp": recent_message.timestamp,
                    "profile_photo": (
                        recent_message.sender.profile_photo
                        if recent_message.sender.id == uid
                        else recent_message.receiver.profile_photo
                    ),
                    "is_read": (
                        recent_message.is_read
                        if recent_message.sender != user
                        else True
                    ),
                }
            )

        return Response(user_data, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_messages_as_read(request):
    """
    Marks all messages from the given team_number to the current user as read.
    Expects a JSON body like: { "team_number": 3647 }
    """
    try:
        user = request.user
        team_number = request.data.get("team_number")

        if not team_number:
            return Response({"error": "team_number is required."}, status=400)

        # Find the sender with that team_number
        try:
            other_user = User.objects.get(team_number=team_number)
        except User.DoesNotExist:
            return Response(
                {"error": "User with that team_number not found."}, status=404
            )

        # Mark all unread messages FROM other_user TO current user as read
        Message.objects.filter(sender=other_user, receiver=user, is_read=False).update(
            is_read=True
        )

        return Response({"detail": "Messages marked as read."}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


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
            send_dm_notification.delay(
                sender_id=sender.id,
                recipient_id=receiver.id,
                message_content=message.message
            )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response(
            {"error": "Sender or receiver not found."}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_part(request, part_id):
    """
    Edit a part's description and link
    """
    try:
        part = Part.objects.get(id=part_id)
        
        # Update only the editable fields
        if 'description' in request.data:
            part.description = request.data['description']
        if 'link' in request.data:
            part.link = request.data['link']
            
        part.save()
        
        serializer = PartSerializer(part)
        return Response(serializer.data)
    except Part.DoesNotExist:
        return Response(
            {"error": "Part not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def password_reset_request(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        # Include both the uidb64 and token in the reset URL
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uidb64}/{token}"
        
        # Use the new password reset email task
        send_password_reset_email.delay(user.id, reset_url)
        
        return Response({'message': 'Password reset email sent'})
    except User.DoesNotExist:
        # Still return success to prevent email enumeration
        return Response({'message': 'Password reset email sent'})

@api_view(['POST'])
def password_reset_confirm(request):
    uidb64 = request.data.get('uidb64')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not all([uidb64, token, new_password]):
        return Response({'message': 'Missing required fields'}, status=400)
    
    try:
        # Decode the user id
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        
        # Validate token
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful'})
        return Response({'message': 'Invalid or expired token'}, status=400)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'message': 'Invalid reset link'}, status=400)


# For Testing
@api_view(['GET'])
def daily_digest_view(request):
    """
    View for handling daily part requests digest.
    """
    send_daily_requests_digest.delay()
    return Response({'message': 'Daily digest email sent'})


@permission_classes([IsAuthenticated])
@api_view(["POST"])
def fulfill_request_view(request, request_id):
    """Mark a request as fulfilled with a specified team."""
    try:
        part_request = PartRequest.objects.get(id=request_id)
        user = request.user
        team_number = request.data.get('team_number')
        
        # Only request owner can mark as fulfilled
        if not part_request.can_fulfill(user):
            return Response(
                {"error": "Only the request owner can mark it as fulfilled."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            fulfilling_team = User.objects.get(team_number=team_number)
        except User.DoesNotExist:
            return Response(
                {"error": f"Team {team_number} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Update fulfillment details
        part_request.is_fulfilled = True
        part_request.fulfilled_by = fulfilling_team
        part_request.fulfillment_date = timezone.now()
        part_request.requires_return = request.data.get('requires_return', False)
        part_request.save()
        
        serializer = PartRequestSerializer(part_request)
        
        # Send WebSocket update if this is a competition request
        if part_request.event_key:
            channel_layer = get_channel_layer()
            serialized_data = json.loads(
                json.dumps(serializer.data, cls=UUIDEncoder)
            )
            async_to_sync(channel_layer.group_send)(
                f"event_{part_request.event_key}",
                {
                    "type": "event.update",
                    "message": {
                        "type": "request_fulfilled",
                        "request": serialized_data
                    }
                }
            )
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except PartRequest.DoesNotExist:
        return Response(
            {"error": "Request not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@permission_classes([IsAuthenticated])
@api_view(["POST"])
def mark_request_returned_view(request, request_id):
    """Mark a fulfilled request as returned."""
    try:
        part_request = PartRequest.objects.get(id=request_id)
        user = request.user
        
        # Only the fulfiller can mark as returned
        if part_request.fulfilled_by.team_number != user.team_number:
            return Response(
                {"error": "Only the fulfilling team can mark the request as returned."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not part_request.is_fulfilled:
            return Response(
                {"error": "Request must be fulfilled before being marked as returned."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not part_request.requires_return:
            return Response(
                {"error": "This request does not require a return."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        part_request.is_returned = True
        part_request.return_date = timezone.now()
        part_request.save()
        
        serializer = PartRequestSerializer(part_request)

        # Send WebSocket update if this is a competition request
        if part_request.event_key:
            channel_layer = get_channel_layer()
            serialized_data = json.loads(
                json.dumps(serializer.data, cls=UUIDEncoder)
            )
            async_to_sync(channel_layer.group_send)(
                f"event_{part_request.event_key}",
                {
                    "type": "event.update",
                    "message": {
                        "type": "request_returned",
                        "request": serialized_data
                    }
                }
            )
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except PartRequest.DoesNotExist:
        return Response(
            {"error": "Request not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(["GET"])
def fulfilled_requests_view(request, team_number):
    """Fetch all requests fulfilled by a team."""
    try:
        user = User.objects.get(team_number=team_number)
        fulfilled = PartRequest.objects.filter(
            fulfilled_by=user,
            is_fulfilled=True
        ).order_by('-fulfillment_date')
        
        serializer = PartRequestSerializer(fulfilled, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {"error": f"User with team number {team_number} not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

@api_view(["GET"])
def received_requests_view(request, team_number):
    """Fetch all requests where the team received parts and needs to return them."""
    try:
        user = User.objects.get(team_number=team_number)
        received = PartRequest.objects.filter(
            user=user,
            is_fulfilled=True,
            requires_return=True,
            is_returned=False
        ).order_by('-fulfillment_date')
        
        serializer = PartRequestSerializer(received, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {"error": f"User with team number {team_number} not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

@permission_classes([IsAuthenticated])
@api_view(["POST"])
def complete_sale_view(request, sale_id):
    """Mark a sale as completed with an optional buyer."""
    try:
        sale = PartSale.objects.get(id=sale_id)
        user = request.user
        team_number = request.data.get('team_number')
        
        # Only sale owner can mark as sold
        if sale.user.team_number != user.team_number:
            return Response(
                {"error": "Only the sale owner can mark it as sold."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if team_number:
            try:
                buying_team = User.objects.get(team_number=team_number)
                sale.sold_to = buying_team
            except User.DoesNotExist:
                return Response(
                    {"error": f"Team {team_number} not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
        # Update sale details
        sale.is_sold = True
        sale.sale_date = timezone.now()
        sale.save()
        
        serializer = PartSaleSerializer(sale)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except PartSale.DoesNotExist:
        return Response(
            {"error": "Sale not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(["GET"])
def bought_items_view(request, team_number):
    """Fetch all items bought by a team."""
    try:
        user = User.objects.get(team_number=team_number)
        bought_items = PartSale.objects.filter(
            sold_to=user,
            is_sold=True
        ).order_by('-sale_date')
        
        serializer = PartSaleSerializer(bought_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {"error": f"User with team number {team_number} not found."},
            status=status.HTTP_404_NOT_FOUND,
        )