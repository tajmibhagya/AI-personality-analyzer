"""
Enrich seed books with LLM-generated text and personality fit tags.

For each book in seed_books.jsonl:
  1. Send title + author + subject hint to the LLM
  2. Get back rich description + personality fit
  3. Write to books.jsonl

Cached locally so re-runs don't re-spend tokens.
"""
import json
import os
import sys
import time
from pathlib import Path

# Make sure we can import from rag/
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from rag.generator import Generator

INPUT = "data/recommender/seed_books.jsonl"
OUTPUT = "data/recommender/books.jsonl"
CACHE = "data/recommender/_enrichment_cache.jsonl"

SYSTEM_PROMPT = """You are an expert book curator and personality psychologist.

Given a book's title, author, and genre hint, generate enrichment data in valid JSON
with this exact shape:

{
  "text": "<100-200 word description structured as: WHAT IT IS (1 sentence) + THEMES/VIBE (2-3 phrases) + SUITS WHO (one sentence starting 'Suits readers who...')>",
  "genres": ["<2-4 genres>"],
  "personality_fit": {
    "openness": "<high|moderate-high|neutral|moderate-low|low>",
    "conscientiousness": "<same scale>",
    "extraversion": "<same scale>",
    "agreeableness": "<same scale>",
    "neuroticism": "<same scale>",
    "reasoning": "<one sentence explaining the main personality match>"
  }
}

Base your assessment on the book's known themes and reading experience. If you don't
know the book, use the title/author/genre hint to make a best-effort plausible call —
the goal is consistent rich data, not perfect accuracy."""


def load_cache() -> dict:
    """Cache key: (title, author). Value: enrichment dict."""
    cache = {}
    if not os.path.exists(CACHE):
        return cache
    with open(CACHE) as f:
        for line in f:
            row = json.loads(line)
            cache[(row["title"], row["author"])] = row["enrichment"]
    return cache


def save_to_cache(title: str, author: str, enrichment: dict):
    with open(CACHE, "a") as f:
        f.write(json.dumps({
            "title": title,
            "author": author,
            "enrichment": enrichment,
        }) + "\n")


def enrich_book(gen: Generator, book: dict) -> dict | None:
    """Call the LLM to enrich one book. Returns None on failure."""
    user = (
        f"Title: {book['title']}\n"
        f"Author: {book['author']}\n"
        f"Genre hint: {book.get('subjects_hint', 'unknown')}\n"
        f"Year: {book.get('year', 'unknown')}\n\n"
        "Return enrichment JSON."
    )
    result = gen.generate(SYSTEM_PROMPT, user, temperature=0.3, max_tokens=500)
    if "error" in result:
        return None
    # Validate required fields
    if "text" not in result or "personality_fit" not in result:
        return None
    return result


def main():
    gen = Generator()
    cache = load_cache()
    print(f"[enrich] Loaded {len(cache)} cached enrichments")

    seeds = []
    with open(INPUT) as f:
        for line in f:
            seeds.append(json.loads(line))
    print(f"[enrich] {len(seeds)} seed books to process")

    enriched = []
    for i, book in enumerate(seeds, 1):
        key = (book["title"], book["author"])
        if key in cache:
            enrichment = cache[key]
        else:
            print(f"[{i}/{len(seeds)}] Enriching: {book['title']} by {book['author']}")
            enrichment = enrich_book(gen, book)
            if enrichment is None:
                print(f"  ✗ Failed, skipping")
                continue
            save_to_cache(book["title"], book["author"], enrichment)
            time.sleep(0.5)  # rate limit politeness

        # Build the final KB row
        row = {
            "id": f"book_{i:04d}",
            "text": enrichment["text"],
            "metadata": {
                "type": "book",
                "title": book["title"],
                "author": book["author"],
                "year": book.get("year"),
                "genres": enrichment.get("genres", []),
                "personality_fit": enrichment["personality_fit"],
                "source_url": f"https://openlibrary.org{book['open_library_key']}",
            },
        }
        enriched.append(row)

    # Write the final KB
    with open(OUTPUT, "w") as f:
        for row in enriched:
            f.write(json.dumps(row) + "\n")
    print(f"\n[enrich] Wrote {len(enriched)} enriched books to {OUTPUT}")


if __name__ == "__main__":
    main()