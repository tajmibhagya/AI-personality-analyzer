"""Build FAISS indexes for all recommender KBs."""
import sys, json, tempfile, pathlib
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from rag.vector_store import KBIndex

def normalize_jsonl(src_path: str, kb_name: str) -> str:
    """Flatten enrichment cache format to {id, text, metadata} format."""
    src = pathlib.Path(src_path)
    if not src.exists():
        raise FileNotFoundError(f"{src_path} not found")
    rows = [json.loads(l) for l in src.read_text().splitlines() if l.strip()]
    normalized = []
    for i, row in enumerate(rows):
        if "text" in row:
            normalized.append(row)
            continue
        text = None
        if "enrichment" in row and isinstance(row["enrichment"], dict):
            text = row["enrichment"].get("text", "")
        if not text:
            parts = []
            for key in ["title", "author", "director", "artist"]:
                if key in row:
                    parts.append(str(row[key]))
            text = " - ".join(parts) if parts else str(row)
        doc_id = row.get("id", f"{kb_name}_{i:03d}")
        metadata = {k: v for k, v in row.items() if k not in ("enrichment",)}
        if "enrichment" in row and isinstance(row["enrichment"], dict):
            for k, v in row["enrichment"].items():
                if k != "text":
                    metadata[k] = v
        normalized.append({"id": doc_id, "text": text, "metadata": metadata})
    tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False)
    for r in normalized:
        tmp.write(json.dumps(r) + "\n")
    tmp.close()
    return tmp.name

KB_SOURCES = [
    ("books",      "data/recommender/_enrichment_cache.jsonl"),
    ("films",      "data/recommender/_enrichment_cache_films.jsonl"),
    ("music",      "data/recommender/_enrichment_cache_music.jsonl"),
    ("activities", "data/recommender/activities.jsonl"),
]

for kb_name, path in KB_SOURCES:
    print(f"\n--- Building {kb_name} ---")
    try:
        normalized_path = normalize_jsonl(path, kb_name)
        kb = KBIndex(kb_name)
        kb.build(normalized_path)
        print(f"  Done: {kb_name}")
    except FileNotFoundError as e:
        print(f"  Skipping {kb_name}: {e}")
    except Exception as e:
        print(f"  Error {kb_name}: {e}")
        import traceback; traceback.print_exc()
