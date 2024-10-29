import json
from django.forms import ValidationError
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from .models import User, Part, PartRequest
from .serializers import UserSerializer, PartSerializer, PartRequestSerializer


# Create your views here.
@api_view(["GET", "POST"])
def user_views(request):
    """views for GETTING and CREATING users"""
    if request.method == "GET":
        return _get_user(request=request)
    if request.method == "POST":
        return _create_user(request=request)


def _create_user(request):
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


def _get_user(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"message": "Login successful", "username": user.email})
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=400)
    return JsonResponse({"error": "Only POST requests are allowed"}, status=405)


@api_view(["GET", "POST"])
def part_views(request):
    """Views for GETTING and CREATING Parts."""
    if request.method == "GET":
        return _get_parts(request=request)
    if request.method == "POST":
        return _create_part(request=request)


def _create_part(request):
    """Handle POST requests to create a new part."""
    serializer = PartSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # Save the new part to the database
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _get_parts(request):
    """Handle GET requests to list all parts."""
    parts = Part.objects.all()
    serializer = PartSerializer(parts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
def part_request_views(request):
    """Views for GETTING and CREATING Part Requests."""
    if request.method == "GET":
        return _get_part_requests(request=request)
    if request.method == "POST":
        return _create_part_request(request=request)


def _create_part_request(request):
    """Handle POST requests to create a new part request."""
    serializer = PartRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # Save the new part request to the database
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _get_part_requests(request):
    """Handle GET requests to list all part requests."""
    part_requests = PartRequest.objects.all()
    serializer = PartRequestSerializer(part_requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
