"""
End-to-end test of the RAG engine using the tiny test KB.
"""
import json
from rag.pipeline import run_rag, rag_cache_stats

# Three different personalities to see if the engine actually differentiates
personas = {
    "high_openness_low_extraversion": {
        "Openness": 0.90, "Conscientiousness": 0.50,
        "Extraversion": 0.20, "Agreeableness": 0.60, "Neuroticism": 0.65,
    },
    "high_extraversion_low_neuroticism": {
        "Openness": 0.45, "Conscientiousness": 0.55,
        "Extraversion": 0.85, "Agreeableness": 0.70, "Neuroticism": 0.20,
    },
    "high_conscientiousness_high_neuroticism": {
        "Openness": 0.40, "Conscientiousness": 0.85,
        "Extraversion": 0.30, "Agreeableness": 0.60, "Neuroticism": 0.80,
    },
}

system = """You recommend a book that fits the user's personality.
Return JSON: {"pick_id": "...", "title": "...", "why": "..."}"""

template = """{personality_summary}

Candidate books:
{retrieved_chunks}

Choose the best match and return json."""

for name, personality in personas.items():
    print(f"\n=== {name} ===")
    result = run_rag(
        kb_name="test",
        query="recommend a book for this person",
        personality=personality,
        system_prompt=system,
        user_prompt_template=template,
        top_k=5,
    )
    print(f"Pick:  {result.get('title')}")
    print(f"Why:   {result.get('why')}")

print("\n=== Cache stats ===")
print(rag_cache_stats())