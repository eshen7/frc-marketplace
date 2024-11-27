import requests
from math import radians, sin, cos, sqrt, atan2
from django.conf import settings


def get_coordinates(address):
    api_key = settings.GOOGLE_API_KEY
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"
    response = requests.get(url)
    data = response.json()
    if data['status'] == 'OK':
        location = data['results'][0]['geometry']['location']
        return location['lat'], location['lng']
    else:
        raise ValueError("Unable to fetch coordinates.")

def haversine(lat1, lon1, lat2, lon2):
    R = 3958.8  # Radius of Earth in miles
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

def calculate_distance(address1, address2):
    lat1, lon1 = get_coordinates(address1)
    lat2, lon2 = get_coordinates(address2)
    return haversine(lat1, lon1, lat2, lon2)