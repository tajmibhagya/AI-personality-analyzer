"""
Fetch a diverse seed list of book titles + authors from Open Library.

Strategy: pull top books from 20 popular subjects, take ~25 from each = ~500 books.
This gives us good genre variety automatically.
"""
import json
import time
import requests

SUBJECTS = [
    "literary_fiction", "mystery", "fantasy", "science_fiction",
    "romance", "thriller", "historical_fiction", "horror",
    "biography", "memoir", "philosophy", "psychology",
    "history", "popular_science", "self_help", "poetry",
    "young_adult", "coming_of_age", "magical_realism", "literary",
]

PER_SUBJECT = 25
OUTPUT = "data/recommender/seed_books.jsonl"

books = {}  # dedupe by (title, author)

for subject in SUBJECTS:
    print(f"Fetching {subject}...")
    url = f"https://openlibrary.org/subjects/{subject}.json?limit={PER_SUBJECT}"
    r = requests.get(url)
    if r.status_code != 200:
        print(f"  skip ({r.status_code})")
        continue
    data = r.json()
    for work in data.get("works", []):
        title = work.get("title")
        authors = work.get("authors", [])
        author = authors[0]["name"] if authors else "Unknown"
        first_publish_year = work.get("first_publish_year")
        key = work.get("key")  # e.g. "/works/OL45804W"

        if not title or not key:
            continue

        dedup_key = (title.lower(), author.lower())
        if dedup_key in books:
            continue

        books[dedup_key] = {
            "title": title,
            "author": author,
            "year": first_publish_year,
            "open_library_key": key,
            "subjects_hint": subject,
        }
    time.sleep(0.5)  # be polite to the API

# Write
with open(OUTPUT, "w") as f:
    for b in books.values():
        f.write(json.dumps(b) + "\n")

print(f"\nSaved {len(books)} unique books to {OUTPUT}")