"""Verify all external APIs are reachable."""
import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

print("--- TMDb ---")

tmdb_key = os.getenv("TMDB_API_KEY")

r = requests.get(
    "https://api.themoviedb.org/3/movie/popular",
    params={
        "api_key": tmdb_key,
        "language": "en-US",
        "page": 1
    }
)

print("Status:", r.status_code)

data = r.json()

if "results" in data:
    print("First film:", data["results"][0]["title"])
else:
    print("❌ TMDb Error:", data)
    
    
print("\n--- Open Library ---")
r = requests.get("https://openlibrary.org/works/OL45804W.json")
print(f"Status: {r.status_code}, title: {r.json()['title']}")

print("\n--- Spotify ---")
client_id = os.getenv("SPOTIFY_CLIENT_ID")
client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
r = requests.post(
    "https://accounts.spotify.com/api/token",
    headers={"Authorization": f"Basic {auth}"},
    data={"grant_type": "client_credentials"},
)
print(f"Auth status: {r.status_code}, got token: {bool(r.json().get('access_token'))}")