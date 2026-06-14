"""
Retriever: clean interface for searching any KB.

Caches KBIndex instances so each KB is loaded from disk only once
per server lifetime.

Usage:
    results = retrieve("books", "introspective novels", k=5)
"""

from rag.vector_store import KBIndex


# Module-level cache: kb_name → loaded KBIndex
_loaded_kbs: dict[str, KBIndex] = {}


def _get_kb(name: str) -> KBIndex:
    """Lazily load a KB index. Reuses cached instance on subsequent calls."""
    if name not in _loaded_kbs:
        kb = KBIndex(name)
        kb.load()  # raises FileNotFoundError if the index isn't built yet
        _loaded_kbs[name] = kb
    return _loaded_kbs[name]


def retrieve(kb_name: str, query: str, k: int = 5) -> list[dict]:
    """Search a knowledge base.

    Args:
        kb_name: which KB to search ('books', 'films', 'music', 'travel', 'test')
        query: the search string
        k: how many results to return

    Returns:
        List of {id, score, metadata} dicts, ordered by relevance.
    """
    kb = _get_kb(kb_name)
    return kb.search(query, k=k)


def warm_up(kb_names: list[str]) -> None:
    """Preload KBs at server startup so the first user request is fast.

    Call this in your FastAPI lifespan hook.
    """
    for name in kb_names:
        try:
            _get_kb(name)
            print(f"[Retriever] Warmed up '{name}'")
        except FileNotFoundError:
            print(f"[Retriever] Skipping '{name}' (not built yet)")