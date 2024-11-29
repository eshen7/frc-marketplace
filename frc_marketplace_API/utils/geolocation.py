import requests
from decouple import config


def get_coordinates(address):
    api_key = config("GOOGLE_API_KEY")
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"
    response = requests.get(url)
    data = response.json()
    if data['status'] == 'OK':
        location = data['results'][0]['geometry']['location']
        return location['lat'], location['lng']
    else:
        raise ValueError("Unable to fetch coordinates.")