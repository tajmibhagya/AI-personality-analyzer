"""
Enrich Last.fm seed tracks with LLM-generated text and personality fit tags.
"""
import json
import os
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from rag.generator import Generator

INPUT = "data/recommender/seed_music.jsonl"
OUTPUT = "data/recommender/music.jsonl"
CACHE = "data/recommender/_enrichment_cache_music.jsonl"

SYSTEM_PROMPT = """You are an expert music curator and personality psychologist.

Given a track (title, artist, Last.fm tags), generate enrichment JSON with this shape:

{
  "text": "<100-200 words: WHAT IT IS (one sentence about the sound/style) + VIBE/THEMES (2-3 phrases) + 'Suits listeners who...' (one sentence about audience)>",
  "personality_fit": {
    "openness": "<high|moderate-high|neutral|moderate-low|low>",
    "conscientiousness": "<same scale>",
    "extraversion": "<same scale>",
    "agreeableness": "<same scale>",
    "neuroticism": "<same scale>",
    "reasoning": "<one sentence linking the music's character to the main personality match>"
  }
}

Base your judgment on what the listening experience offers — energy, mood, lyrical themes,
sonic complexity. If you don't know the track specifically, infer from the artist and tags.

Examples of trait mapping:
- Ambient/post-rock/jazz → often high openness, low extraversion
- High-energy pop/dance → often high extraversion, low neuroticism
- Confessional indie/singer-songwriter → often high neuroticism, moderate openness
- Polished mainstream pop → often moderate-low openness, high agreeableness
- Experimental/noise/avant-garde → very high openness
"""


def load_cache():
    cache = {}
    if not os.path.exists(CACHE):
        return cache
    with open(CACHE) as f:
        for line in f:
            row = json.loads(line)
            cache[row["key"]] = row["enrichment"]
    return cache


def save_to_cache(key, enrichment):
    with open(CACHE, "a") as f:
        f.write(json.dumps({"key": key, "enrichment": enrichment}) + "\n")


def main():
    gen = Generator()
    cache = load_cache()
    print(f"[enrich_music] {len(cache)} cached")

    seeds = []
    with open(INPUT) as f:
        for line in f:
            seeds.append(json.loads(line))
    print(f"[enrich_music] {len(seeds)} tracks to process")

    enriched = []
    for i, track in enumerate(seeds, 1):
        key = f"{track['title']}|{track['artist']}"
        if key in cache:
            enrichment = cache[key]
        else:
            print(f"[{i}/{len(seeds)}] {track['title']} — {track['artist']}")
            user = (
                f"Title: {track['title']}\n"
                f"Artist: {track['artist']}\n"
                f"Last.fm tags: {', '.join(track.get('tags', []))}\n\n"
                "Return enrichment JSON."
            )
            enrichment = gen.generate(SYSTEM_PROMPT, user, temperature=0.3, max_tokens=500)
            if "error" in enrichment or "text" not in enrichment:
                print(f"  ✗ failed")
                continue
            save_to_cache(key, enrichment)
            time.sleep(0.5)

        row = {
            "id": f"music_{i:04d}",
            "text": enrichment["text"],
            "metadata": {
                "type": "music",
                "title": track["title"],
                "artist": track["artist"],
                "tags": track.get("tags", []),
                "personality_fit": enrichment["personality_fit"],
                "source_url": track.get("lastfm_url", ""),
            },
        }
        enriched.append(row)

    with open(OUTPUT, "w") as f:
        for row in enriched:
            f.write(json.dumps(row) + "\n")
    print(f"\nWrote {len(enriched)} tracks to {OUTPUT}")


if __name__ == "__main__":
    main()