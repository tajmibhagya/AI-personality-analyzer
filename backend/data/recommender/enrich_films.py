"""Enrich seed films with LLM-generated text and personality fit tags."""
import json
import os
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from rag.generator import Generator

INPUT = "data/recommender/seed_films.jsonl"
OUTPUT = "data/recommender/films.jsonl"
CACHE = "data/recommender/_enrichment_cache_films.jsonl"

TMDB_GENRES = {
    28: "action", 12: "adventure", 16: "animation", 35: "comedy",
    80: "crime", 99: "documentary", 18: "drama", 10751: "family",
    14: "fantasy", 36: "history", 27: "horror", 10402: "music",
    9648: "mystery", 10749: "romance", 878: "sci-fi", 53: "thriller",
    10752: "war", 37: "western",
}

SYSTEM_PROMPT = """You are an expert film curator and personality psychologist.

Given a film's title, overview, and genres, generate enrichment JSON with this shape:

{
  "text": "<100-200 word description: WHAT IT IS + THEMES/VIBE + SUITS WHO (starts 'Suits viewers who...')>",
  "personality_fit": {
    "openness": "<high|moderate-high|neutral|moderate-low|low>",
    "conscientiousness": "<same scale>",
    "extraversion": "<same scale>",
    "agreeableness": "<same scale>",
    "neuroticism": "<same scale>",
    "reasoning": "<one sentence>"
  }
}

Base it on the actual viewing experience the film offers."""


def load_cache():
    cache = {}
    if not os.path.exists(CACHE):
        return cache
    with open(CACHE) as f:
        for line in f:
            row = json.loads(line)
            cache[row["tmdb_id"]] = row["enrichment"]
    return cache


def save_to_cache(tmdb_id, enrichment):
    with open(CACHE, "a") as f:
        f.write(json.dumps({"tmdb_id": tmdb_id, "enrichment": enrichment}) + "\n")


def main():
    gen = Generator()
    cache = load_cache()
    print(f"[enrich_films] {len(cache)} cached")

    seeds = []
    with open(INPUT) as f:
        for line in f:
            seeds.append(json.loads(line))
    print(f"[enrich_films] {len(seeds)} films to process")

    enriched = []
    for i, film in enumerate(seeds, 1):
        # Skip films with no overview — LLM can't enrich them well
        if not film.get("overview"):
            continue

        tmdb_id = film["tmdb_id"]
        if tmdb_id in cache:
            enrichment = cache[tmdb_id]
        else:
            print(f"[{i}/{len(seeds)}] {film['title']}")
            genres = [TMDB_GENRES.get(g, "unknown") for g in film.get("genre_ids", [])]
            user = (
                f"Title: {film['title']}\n"
                f"Overview: {film['overview']}\n"
                f"Genres: {', '.join(genres)}\n"
                f"Year: {film.get('release_date', '')[:4]}\n\n"
                "Return enrichment JSON."
            )
            enrichment = gen.generate(SYSTEM_PROMPT, user, temperature=0.3, max_tokens=500)
            if "error" in enrichment or "text" not in enrichment:
                continue
            save_to_cache(tmdb_id, enrichment)
            time.sleep(0.5)

        genres = [TMDB_GENRES.get(g, "unknown") for g in film.get("genre_ids", [])]
        row = {
            "id": f"film_{i:04d}",
            "text": enrichment["text"],
            "metadata": {
                "type": "film",
                "title": film["title"],
                "year": int(film["release_date"][:4]) if film.get("release_date") else None,
                "genres": genres,
                "personality_fit": enrichment["personality_fit"],
                "source_url": f"https://www.themoviedb.org/movie/{tmdb_id}",
            },
        }
        enriched.append(row)

    with open(OUTPUT, "w") as f:
        for row in enriched:
            f.write(json.dumps(row) + "\n")
    print(f"\nWrote {len(enriched)} films to {OUTPUT}")


if __name__ == "__main__":
    main()