"""Build FAISS indexes for all recommender KBs."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from rag.vector_store import KBIndex

for kb_name, path in [
    ("books", "data/recommender/books.jsonl"),
    ("films", "data/recommender/films.jsonl"),
    ("music", "data/recommender/music.jsonl"),
    ("activities", "data/recommender/activities.jsonl"),
]:
    print(f"\n--- Building {kb_name} ---")
    try:
        kb = KBIndex(kb_name)
        kb.build(path)
    except FileNotFoundError:
        print(f"  ⚠ Skipping {kb_name}: {path} not found")
    except ValueError as e:
        print(f"  ⚠ Skipping {kb_name}: {e}")