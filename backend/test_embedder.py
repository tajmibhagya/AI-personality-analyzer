from rag.embedder import Embedder
emb = Embedder()

# Single embed
v1 = emb.embed("I love going to parties")
v2 = emb.embed("Social gatherings are my favorite")
v3 = emb.embed("The mitochondria is the powerhouse of the cell")

print("Shape:", v1.shape)  # should be (384,)

# Similarity (dot product of normalized vectors = cosine similarity)
import numpy as np
print(f"v1 vs v2 (should be high):   {np.dot(v1, v2):.3f}")
print(f"v1 vs v3 (should be low):    {np.dot(v1, v3):.3f}")