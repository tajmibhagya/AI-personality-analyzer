"""Fetch popular + top-rated films from TMDb across categories."""
import json
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("TMDB_API_KEY")
OUTPUT = "data/recommender/seed_films.jsonl"

# Mix of popular, top_rated, and specific genres for variety
ENDPOINTS = [
    ("popular", "https://api.themoviedb.org/3/movie/popular?language=en-US&page={page}"),
    ("top_rated", "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page={page}"),
]

# Genre IDs (from TMDb)
GENRES = {
    "drama": 18, "comedy": 35, "thriller": 53, "sci-fi": 878,
    "romance": 10749, "horror": 27, "documentary": 99, "animation": 16,
}

films = {}  # dedupe by id

# Get from popular + top_rated, 5 pages each (100 films per category)
for name, url_template in ENDPOINTS:
    print(f"Fetching {name}...")
    for page in range(1, 6):
        r = requests.get(
    url_template.format(page=page),
    params={"api_key": API_KEY}
)
        if r.status_code != 200:
            continue
        for film in r.json().get("results", []):
            films[film["id"]] = film
        time.sleep(0.3)

# Get from genres for variety
for genre_name, genre_id in GENRES.items():
    print(f"Fetching genre {genre_name}...")
    url = (
        f"https://api.themoviedb.org/3/discover/movie?language=en-US"
        f"&sort_by=popularity.desc&with_genres={genre_id}&page=1"
    )
    r = requests.get(url, params={"api_key": API_KEY})
    if r.status_code != 200:
        continue
    for film in r.json().get("results", []):
        films.setdefault(film["id"], film)
    time.sleep(0.3)

print(f"\n{len(films)} unique films collected")

# Write seed
with open(OUTPUT, "w") as f:
    for film in films.values():
        seed = {
            "tmdb_id": film["id"],
            "title": film["title"],
            "overview": film.get("overview", ""),
            "release_date": film.get("release_date", ""),
            "genre_ids": film.get("genre_ids", []),
        }
        f.write(json.dumps(seed) + "\n")

print(f"Saved to {OUTPUT}")