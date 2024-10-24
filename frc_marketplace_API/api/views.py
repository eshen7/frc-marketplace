from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
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
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # save new user to database
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _get_user(request):
    return Response(
        UserSerializer({"email": "123@gg.com", "password": "12345678"}).data
    )

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