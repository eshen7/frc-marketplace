import requests
from decouple import config

BASE_URL = "https://www.thebluealliance.com/api/v3/"

def getTeamName(team_number):
    api_key = config("BLUE_ALLIANCE_API_KEY")
    url = f"{BASE_URL}team/frc{team_number}"

    headers = {
        "X-TBA-Auth-Key": api_key,
    }

    try:
        response = requests.get(url, headers=headers)

        response.raise_for_status()
        data = response.json()

        return data["nickname"]
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for team {team_number}: {e}")
        return None


