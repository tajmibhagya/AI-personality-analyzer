"""
RAG pipeline: retrieve → format → generate, with LRU caching.

This is the unified entry point both features (recommender, travel) call.
"""

import json
from functools import lru_cache

from rag.retriever import retrieve
from rag.generator import Generator


def _format_chunks(chunks: list[dict]) -> str:
    """Format retrieved chunks as readable text for the LLM prompt."""
    lines = []
    for i, chunk in enumerate(chunks, 1):
        lines.append(f"--- Chunk {i} ---")
        lines.append(f"id: {chunk['id']}")
        lines.append(f"relevance_score: {chunk['score']:.3f}")
        meta = chunk["metadata"]
        for key, value in meta.items():
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            lines.append(f"{key}: {value}")
        lines.append("")
    return "\n".join(lines)


def _format_personality(personality: dict) -> str:
    """Format personality scores as a readable summary."""
    sorted_traits = sorted(personality.items(), key=lambda kv: -kv[1])
    lines = ["User's Big Five profile (0 = low, 1 = high):"]
    for trait, score in sorted_traits:
        if score > 0.7:
            label = "high"
        elif score > 0.5:
            label = "moderate-high"
        elif score > 0.3:
            label = "moderate-low"
        else:
            label = "low"
        lines.append(f"  - {trait}: {score:.2f} ({label})")
    return "\n".join(lines)


@lru_cache(maxsize=128)
def _cached_run_rag(
    kb_name: str,
    query: str,
    personality_json: str,
    system_prompt: str,
    user_prompt_template: str,
    top_k: int,
    extra_context_json: str,
) -> str:
    """Internal cached worker. All args are hashable strings/ints."""
    personality = json.loads(personality_json)
    extra_context = json.loads(extra_context_json) if extra_context_json != "null" else None

    chunks = retrieve(kb_name, query, k=top_k)
    if not chunks:
        return json.dumps({"error": f"No results found in KB '{kb_name}'."})

    personality_summary = _format_personality(personality)
    retrieved_text = _format_chunks(chunks)

    extra_text = ""
    if extra_context:
        extra_lines = [f"{k}: {v}" for k, v in extra_context.items()]
        extra_text = "\n".join(extra_lines)

    user_prompt = user_prompt_template.format(
        personality_summary=personality_summary,
        retrieved_chunks=retrieved_text,
        extra=extra_text,
    )

    gen = Generator()
    result = gen.generate(system_prompt, user_prompt)
    result["_retrieved_ids"] = [c["id"] for c in chunks]

    return json.dumps(result)


def run_rag(
    kb_name: str,
    query: str,
    personality: dict,
    system_prompt: str,
    user_prompt_template: str,
    top_k: int = 10,
    extra_context: dict = None,
) -> dict:
    """Public entry point. Handles dict→string conversion for caching."""
    personality_rounded = {k: round(v, 2) for k, v in personality.items()}
    personality_json = json.dumps(personality_rounded, sort_keys=True)
    extra_context_json = json.dumps(extra_context, sort_keys=True) if extra_context else "null"

    result_json = _cached_run_rag(
        kb_name=kb_name,
        query=query,
        personality_json=personality_json,
        system_prompt=system_prompt,
        user_prompt_template=user_prompt_template,
        top_k=top_k,
        extra_context_json=extra_context_json,
    )
    return json.loads(result_json)


def clear_rag_cache():
    """Useful for testing or after KB updates."""
    _cached_run_rag.cache_clear()


def rag_cache_stats():
    """Inspect cache performance."""
    return _cached_run_rag.cache_info()