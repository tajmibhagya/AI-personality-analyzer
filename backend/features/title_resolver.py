"""Resolve titles for recommendations using TMDB and LastFM APIs."""
import os, requests
from functools import lru_cache

TMDB_KEY = os.getenv("TMDB_API_KEY", "")
LASTFM_KEY = os.getenv("LASTFM_API_KEY", "")

@lru_cache(maxsize=512)
def resolve_film_title(tmdb_id: int) -> str:
    if not TMDB_KEY or not tmdb_id:
        return ""
    try:
        r = requests.get(
            f"https://api.themoviedb.org/3/movie/{tmdb_id}",
            params={"api_key": TMDB_KEY},
            timeout=3
        )
        if r.ok:
            return r.json().get("title", "")
    except Exception:
        pass
    return ""

def enrich_recommendation(rec: dict, medium: str) -> dict:
    """Add real title to recommendation if missing or is an ID."""
    title = rec.get("title", "")
    metadata = rec.get("metadata", {})
    needs_fix = not title or title.startswith(f"{medium}_") or len(title) > 80

    if medium == "films" and needs_fix:
        tmdb_id = metadata.get("tmdb_id")
        if tmdb_id:
            real_title = resolve_film_title(int(tmdb_id))
            if real_title:
                rec = dict(rec)
                rec["title"] = real_title
                rec["metadata"] = dict(metadata)
                rec["metadata"]["title"] = real_title
                return rec

    if medium == "music" and needs_fix:
        key = metadata.get("key", "")
        if "|" in str(key):
            parts = str(key).split("|")
            track = parts[0].strip()
            artist = parts[1].strip() if len(parts) > 1 else ""
            real_title = f"{track} — {artist}" if artist else track
            rec = dict(rec)
            rec["title"] = real_title
            rec["metadata"] = dict(metadata)
            rec["metadata"]["title"] = real_title
            return rec

    return rec
