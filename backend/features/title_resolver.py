"""Resolve titles and platform links for recommendations."""
import os, requests
from functools import lru_cache

TMDB_KEY = os.getenv("TMDB_API_KEY", "")

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

def get_platform_url(title: str, medium: str, metadata: dict) -> str:
    """Generate platform-specific search URL."""
    query = title.replace(" ", "+").replace("—", "").strip()
    if medium == "books":
        return f"https://www.goodreads.com/search?q={query}"
    elif medium == "films":
        return f"https://www.imdb.com/find?q={query}"
    elif medium == "music":
        return f"https://open.spotify.com/search/{query}"
    else:
        return f"https://www.google.com/search?q={query}"

def looks_like_description(title: str, medium: str) -> bool:
    if not title:
        return True
    if title.startswith(f"{medium}_"):
        return True
    if title.startswith("{"):
        return True
    if len(title) > 60:
        return True
    if title[0].islower():
        return True
    desc_starters = ["A ", "An ", "The "]
    for s in desc_starters:
        if title.startswith(s) and len(title) > 40:
            return True
    return False

def enrich_recommendation(rec: dict, medium: str) -> dict:
    title = rec.get("title", "")
    metadata = rec.get("metadata", {})

    if medium == "films":
        tmdb_id = metadata.get("tmdb_id")
        if tmdb_id:
            real_title = resolve_film_title(int(tmdb_id))
            if real_title:
                rec = dict(rec)
                rec["title"] = real_title
                rec["metadata"] = dict(metadata)
                rec["metadata"]["title"] = real_title
                rec["metadata"]["platform_url"] = get_platform_url(real_title, medium, metadata)
                return rec

    if medium == "music":
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
            rec["metadata"]["platform_url"] = get_platform_url(real_title, medium, metadata)
            return rec

    if medium == "activities":
        name = metadata.get("name", "")
        if name:
            rec = dict(rec)
            rec["title"] = name
            rec["metadata"] = dict(metadata)
            rec["metadata"]["title"] = name
            rec["metadata"]["platform_url"] = get_platform_url(name, medium, metadata)
            return rec

    if looks_like_description(title, medium):
        for field in ["name", "title"]:
            val = metadata.get(field, "")
            if val and not looks_like_description(str(val), medium):
                rec = dict(rec)
                rec["title"] = str(val)
                rec["metadata"] = dict(metadata)
                rec["metadata"]["title"] = str(val)
                rec["metadata"]["platform_url"] = get_platform_url(str(val), medium, metadata)
                return rec

    if title and not looks_like_description(title, medium):
        rec = dict(rec)
        rec["metadata"] = dict(metadata)
        rec["metadata"]["platform_url"] = get_platform_url(title, medium, metadata)

    return rec
# restart-trigger
