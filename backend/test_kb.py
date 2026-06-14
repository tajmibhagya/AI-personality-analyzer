from rag.vector_store import KBIndex

kb = KBIndex("test")
kb.build("data/test/tiny.jsonl")

# Search 1: introspective query
print("\n--- Query: 'thoughtful slow philosophical book' ---")
for r in kb.search("thoughtful slow philosophical book", k=3):
    print(f"  {r['score']:.3f}  {r['metadata']['title']}")

# Search 2: action query
print("\n--- Query: 'fast exciting action story' ---")
for r in kb.search("fast exciting action story", k=3):
    print(f"  {r['score']:.3f}  {r['metadata']['title']}")