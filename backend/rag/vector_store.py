"""
KBIndex: a FAISS-backed knowledge base.

Stores vectors in FAISS, metadata in a JSON sidecar file.

Usage:
    # Build once:
    kb = KBIndex("books")
    kb.build("backend/data/recommender/books.jsonl")

    # Use forever after:
    kb = KBIndex("books")
    kb.load()
    results = kb.search("introspective novels", k=5)
"""

import json
import os
from pathlib import Path

import faiss
import numpy as np

from rag.embedder import Embedder


INDEX_DIR = Path(__file__).resolve().parent.parent / "index_store"

class KBIndex:
    """A persistent vector index over a JSONL knowledge base."""

    def __init__(self, name: str):
        self.name = name
        self.index_path = INDEX_DIR / f"{name}.faiss"
        self.meta_path = INDEX_DIR / f"{name}.meta.json"
        self.embedder = Embedder()
        self.index = None      # FAISS index
        self.id_to_meta = {}   # dict mapping string id → full metadata
        self.id_order = []     # list of ids in the order they appear in the index

    def build(self, jsonl_path: str) -> None:
        """Read a JSONL file, embed all `text` fields, build FAISS index, save to disk.
        
        Expected JSONL row format:
            {"id": "book_001", "text": "embed me", "metadata": {...}}
        """
        # Step 1: read the JSONL
        rows = []
        with open(jsonl_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                rows.append(json.loads(line))

        if not rows:
            raise ValueError(f"No rows found in {jsonl_path}")

        print(f"[KBIndex:{self.name}] Loaded {len(rows)} rows from {jsonl_path}")

        # Step 2: collect ids, texts, metadata
        ids = [row["id"] for row in rows]
        texts = [row["text"] for row in rows]
        metas = [row.get("metadata", {}) for row in rows]

        # Step 3: embed all texts at once (batched, much faster than one-by-one)
        print(f"[KBIndex:{self.name}] Embedding {len(texts)} documents...")
        vectors = self.embedder.embed_batch(texts)  # shape (N, 384)
        vectors = vectors.astype("float32")  # FAISS requires float32

        # Step 4: build FAISS index
        # IndexFlatIP = inner product (= cosine sim since we normalized)
        # IP is correct here because embeddings are unit-length
        dim = vectors.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(vectors)
        print(f"[KBIndex:{self.name}] Indexed {self.index.ntotal} vectors of dim {dim}")

        # Step 5: store metadata
        self.id_order = ids
        self.id_to_meta = {ids[i]: metas[i] for i in range(len(ids))}

        # Step 6: persist to disk
        INDEX_DIR.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(self.index_path))
        with open(self.meta_path, "w") as f:
            json.dump({"id_order": self.id_order, "id_to_meta": self.id_to_meta}, f)
        print(f"[KBIndex:{self.name}] Saved to {self.index_path} and {self.meta_path}")

    def load(self) -> None:
        """Load a previously-built index from disk."""
        if not self.index_path.exists() or not self.meta_path.exists():
            raise FileNotFoundError(
                f"Index for '{self.name}' not built yet. Call .build() first."
            )
        self.index = faiss.read_index(str(self.index_path))
        with open(self.meta_path, "r") as f:
            data = json.load(f)
        self.id_order = data["id_order"]
        self.id_to_meta = data["id_to_meta"]
        print(f"[KBIndex:{self.name}] Loaded {self.index.ntotal} vectors")

    def search(self, query: str, k: int = 5) -> list[dict]:
        """Find the k closest documents to the query string.

        Returns list of {id, score, metadata}, ordered by descending similarity.
        """
        if self.index is None:
            raise RuntimeError("Index not loaded. Call .build() or .load() first.")

        # Embed query, reshape to (1, dim) because FAISS expects a batch
        q_vec = self.embedder.embed(query).astype("float32").reshape(1, -1)

        # FAISS search returns:
        #   D = (1, k) array of similarity scores
        #   I = (1, k) array of integer indices into our id_order list
        D, I = self.index.search(q_vec, k)

        results = []
        for score, idx in zip(D[0], I[0]):
            if idx < 0:  # FAISS returns -1 for missing slots
                continue
            doc_id = self.id_order[idx]
            results.append({
                "id": doc_id,
                "score": float(score),
                "metadata": self.id_to_meta[doc_id],
            })
        return results