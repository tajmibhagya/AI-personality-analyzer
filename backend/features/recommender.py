"""
Recommender feature: turns a personality profile into 3 reasoned picks from a KB.
"""
import json
from rag.pipeline import run_rag

VALID_MEDIA = {"books", "films", "music", "activities"}

SYSTEM_PROMPT = """You are an expert curator. Given a user's Big Five personality
profile and a list of candidate items, pick the THREE that best fit them and explain why.

Selection criteria:
- Prioritize items whose personality_fit aligns with the user's dominant traits.
- Avoid recommending three items that are too similar to each other — give variety.
- Be honest: if no candidate is a strong fit, say so in the 'why' field rather than overselling.
- Cite the exact id field from the candidates you pick.

Return JSON with this EXACT shape:

{
  "recommendations": [
    {
      "id": "<exact id from the candidate>",
      "title": "<the title, name, or activity name from the candidate>",
      "why": "<2-3 sentences explaining the match, referencing BOTH personality traits AND the item's character>",
      "trait_drivers": ["<trait names that drove the match, e.g. 'Openness', 'Neuroticism'>"]
    },
    {...},
    {...}
  ]
}

Output ONLY the json object. No preamble, no markdown fences."""


USER_PROMPT_TEMPLATE = """{personality_summary}

{extra}

Candidate items:
{retrieved_chunks}

Pick the 3 best matches and return json."""


def _build_query(personality: dict, mood: str | None) -> str:
    """Build a query string for FAISS retrieval based on dominant traits + mood."""
    # Sort traits, take top 2
    sorted_traits = sorted(personality.items(), key=lambda kv: -kv[1])
    top_traits = [t for t, _ in sorted_traits[:2]]

    trait_phrases = {
        "Openness": "imaginative, curious, novel, abstract, philosophical",
        "Conscientiousness": "structured, disciplined, methodical, organized",
        "Extraversion": "social, energetic, lively, stimulating",
        "Agreeableness": "warm, cooperative, gentle, compassionate",
        "Neuroticism": "emotional, introspective, intense, reflective",
    }
    query_parts = [trait_phrases.get(t, t.lower()) for t in top_traits]

    if mood:
        query_parts.append(mood)

    return " ".join(query_parts)


def recommend(
    personality: dict,
    medium: str,
    mood: str | None = None,
    exclude_ids: list[str] = None,
) -> dict:
    """Return a list of 3 personalized recommendations for the given medium.

    Returns a dict shaped like RecommendResponse.
    """
    if medium not in VALID_MEDIA:
        return {
            "medium": medium,
            "error": f"Unknown medium '{medium}'. Valid: {sorted(VALID_MEDIA)}",
            "recommendations": [],
        }

    if not personality:
        return {"medium": medium, "error": "No personality provided", "recommendations": []}

    exclude_ids = set(exclude_ids or [])

    # Build retrieval query and call the pipeline
    query = _build_query(personality, mood)

    # Retrieve extra (top_k=15) so we have room to filter out excluded ids
    result = run_rag(
        kb_name=medium,
        query=query,
        personality=personality,
        system_prompt=SYSTEM_PROMPT,
        user_prompt_template=USER_PROMPT_TEMPLATE,
        top_k=15 if not exclude_ids else 25,  # more candidates if excluding past picks
        extra_context={"mood": mood} if mood else None,
    )

    if "error" in result:
        return {
            "medium": medium,
            "error": result["error"],
            "recommendations": [],
        }

    raw_recs = result.get("recommendations", [])
    retrieved_ids = result.get("_retrieved_ids", [])

    # Filter out excluded ids (in case the LLM still picked them)
    raw_recs = [r for r in raw_recs if r.get("id") not in exclude_ids]

    # Attach metadata to each recommendation by looking up the id in the retrieved set.
    # We need the metadata for the UI cards (author, year, source_url, etc.)
    from rag.retriever import _get_kb
    kb = _get_kb(medium)
    enriched_recs = []
    for r in raw_recs[:3]:
        rec_id = r.get("id")
        meta = kb.id_to_meta.get(rec_id, {})
        enriched_recs.append({
            "id": rec_id,
            "title": r.get("title", "Unknown"),
            "why": r.get("why", ""),
            "trait_drivers": r.get("trait_drivers", []),
            "metadata": meta,
        })

    return {
        "medium": medium,
        "recommendations": enriched_recs,
    }