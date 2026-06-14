from rag.pipeline import run_rag

system_prompt = """You are a thoughtful book recommender. Given a user's Big Five personality
and a list of candidate books, pick the ONE that fits them best and explain why.

Return JSON with this exact shape:
{
  "pick_id": "<the id of the chosen book>",
  "title": "<title>",
  "why": "<2-sentence explanation referencing both the personality traits and the book>"
}"""

user_template = """{personality_summary}

Here are candidate books:
{retrieved_chunks}

Pick the single best book for this person and explain why in json format."""

personality = {
    "Openness": 0.85,
    "Conscientiousness": 0.40,
    "Extraversion": 0.30,
    "Agreeableness": 0.55,
    "Neuroticism": 0.60,
}

result = run_rag(
    kb_name="test",
    query="introspective philosophical novel",
    personality=personality,
    system_prompt=system_prompt,
    user_prompt_template=user_template,
    top_k=3,
)

import json
print(json.dumps(result, indent=2))