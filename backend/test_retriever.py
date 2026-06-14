from rag.retriever import retrieve, warm_up

# Pretend we're a server starting up
warm_up(["test"])

# Now any request is fast (KB already loaded)
print("\n--- Retrieval test ---")
results = retrieve("test", "anxious narrator family conflict", k=3)
for r in results:
    print(f"  {r['score']:.3f}  {r['metadata']['title']}")