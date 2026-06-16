"""
Fetch a diverse seed list of tracks from Last.fm by tag.

Last.fm's tag.gettoptracks endpoint returns top tracks per genre/tag.
We pull from 15 diverse tags for broad coverage, then dedupe.
"""
import json
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("LASTFM_API_KEY")
OUTPUT = "data/recommender/seed_music.jsonl"

if not API_KEY:
    raise SystemExit("LASTFM_API_KEY missing from .env")

# Diverse tags. Last.fm has thousands; these give broad genre coverage.
TAGS = [
    "indie", "electronic", "rock", "hip-hop", "jazz",
    "classical", "folk", "ambient", "metal", "pop",
    "rnb", "soundtrack", "alternative", "post-rock", "experimental",
]

PER_TAG = 50  # ~750 tracks total before dedup
tracks = {}  # key: (title.lower(), artist.lower()) for dedup

for tag in TAGS:
    print(f"Fetching tag: {tag}")
    url = (
        "https://ws.audioscrobbler.com/2.0/"
        f"?method=tag.gettoptracks&tag={tag}&api_key={API_KEY}"
        f"&format=json&limit={PER_TAG}"
    )
    try:
        r = requests.get(url, timeout=15)
        if r.status_code != 200:
            print(f"  skip ({r.status_code})")
            continue
        data = r.json()
        for t in data.get("tracks", {}).get("track", []):
            title = t.get("name")
            artist_field = t.get("artist")
            # artist can be a dict {"name": ...} or sometimes a string
            if isinstance(artist_field, dict):
                artist = artist_field.get("name")
            else:
                artist = artist_field
            mbid = t.get("mbid") or ""
            url_lf = t.get("url", "")

            if not title or not artist:
                continue

            key = (title.lower(), artist.lower())
            if key in tracks:
                # Already have it — append this tag for richer context
                tracks[key]["tags"].append(tag)
                continue
            tracks[key] = {
                "title": title,
                "artist": artist,
                "mbid": mbid,
                "lastfm_url": url_lf,
                "tags": [tag],
            }
    except Exception as e:
        print(f"  error: {e}")
    time.sleep(0.3)

print(f"\n{len(tracks)} unique tracks")

with open(OUTPUT, "w") as f:
    for t in tracks.values():
        f.write(json.dumps(t) + "\n")
print(f"Saved to {OUTPUT}")