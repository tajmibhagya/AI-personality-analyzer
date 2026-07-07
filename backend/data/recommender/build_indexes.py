"""Build FAISS indexes for all recommender KBs."""
import sys, json, tempfile, pathlib, re
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from rag.vector_store import KBIndex

def extract_title(text: str) -> str:
    """Extract title from first sentence of enrichment text."""
    if not text:
        return ""
    first = text.split(".")[0].strip()
    for verb in [" is ", " follows ", " explores ", " tells ", " depicts ",
                 " chronicles ", " centers ", " offers ", " features ",
                 " focuses ", " presents ", " sets ", " takes ", " shows "]:
        if verb in first:
            candidate = first.split(verb)[0].strip()
            candidate = re.sub(r'^(The film |The book |The album |The song |The series )', '', candidate)
            if 1 < len(candidate) < 80:
                return candidate
    if len(first) < 80:
        return first
    return first[:60]

def normalize_jsonl(src_path: str, kb_name: str) -> str:
    src = pathlib.Path(src_path)
    if not src.exists():
        raise FileNotFoundError(f"{src_path} not found")
    rows = [json.loads(l) for l in src.read_text().splitlines() if l.strip()]
    normalized = []
    for i, row in enumerate(rows):
        if "text" in row and "title" in row:
            normalized.append(row)
            continue
        enrichment = row.get("enrichment", {}) if isinstance(row.get("enrichment"), dict) else {}
        text = enrichment.get("text", "")
        if not text:
            parts = [str(row[k]) for k in ["title", "author", "director", "artist"] if k in row]
            text = " - ".join(parts) if parts else str(row)
        title = (row.get("title") or
                 row.get("name") or
                 enrichment.get("title") or
                 extract_title(text) or
                 f"{kb_name}_{i:03d}")
        doc_id = row.get("id", f"{kb_name}_{i:03d}")
        metadata = {k: v for k, v in row.items() if k != "enrichment"}
        metadata["title"] = title
        for k, v in enrichment.items():
            if k != "text":
                metadata[k] = v
        normalized.append({
            "id": doc_id,
            "title": title,
            "text": text,
            "metadata": metadata
        })
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
