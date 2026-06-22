"""
Embedder: turns text into 384-dimensional vectors.

We use sentence-transformers' all-MiniLM-L6-v2:
- 384 dimensions
- ~80MB model size
- Runs on CPU in milliseconds
- Trained on 1B+ pairs of similar sentences, so it captures semantic similarity well

Usage:
    emb = Embedder()
    vec = emb.embed("hello world")              # numpy array, shape (384,)
    batch = emb.embed_batch(["hi", "yo", "sup"]) # numpy array, shape (3, 384)
"""

import numpy as np
from sentence_transformers import SentenceTransformer


class Embedder:
    """Wraps a sentence-transformer model. Loads once, reuses forever."""

    _instance = None  # singleton pattern — load the model only once per process

    def __new__(cls, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        if cls._instance is None or not hasattr(cls._instance, "model"):

            cls._instance = super().__new__(cls)
            print(f"[Embedder] Loading {model_name} (first time only)...")
            cls._instance.model = SentenceTransformer(model_name)
            cls._instance.dim = cls._instance.model.get_sentence_embedding_dimension()
            print(f"[Embedder] Ready. Dimension = {cls._instance.dim}")
        return cls._instance

    def embed(self, text: str) -> np.ndarray:
        """Embed a single string. Returns a 1D numpy array of shape (dim,)."""
        # convert_to_numpy=True → returns numpy array, not torch tensor
        # normalize_embeddings=True → unit-length vectors, makes cosine similarity = dot product (faster)
        return self.model.encode(
            text,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )

    def embed_batch(self, texts: list[str], batch_size: int = 32) -> np.ndarray:
        """Embed many strings at once. Returns 2D array of shape (len(texts), dim).
        
        Batching is much faster than calling embed() in a loop — the model
        processes 32 sentences in parallel.
        """
        return self.model.encode(
            texts,
            batch_size=batch_size,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=len(texts) > 100,  # show bar only for big batches
        )