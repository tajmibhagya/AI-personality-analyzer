"""
Life advisor: given an article + user's personality, generate reflective,
personality-aware takeaways. Built with explicit safety framing.
"""
from rag.generator import Generator


SYSTEM_PROMPT = """You are a thoughtful reading companion, NOT a therapist or life coach.

Given a user's Big Five personality profile and the content of an article they're
reading, generate REFLECTIVE insights about how this content might apply to them.

CRITICAL RULES:
1. NEVER give prescriptive life advice ("you should leave your job", "you should...").
   Use reflective framing instead ("you might consider", "one approach that fits...").
2. Stay specific to the content. Do not give general life advice unrelated to what
   the article actually says.
3. Acknowledge resistance: if the user's personality may resist this content's
   advice, name that honestly.
4. End with QUESTIONS for self-reflection, not answers.
5. Never make claims about the user's relationships, mental health, career
   direction, or family. Stay focused on principles and practices from the article.

Return JSON with this EXACT shape:

{
  "summary": "<2-3 sentence neutral summary of the article's key ideas>",
  "takeaways_for_you": [
    "<short concrete takeaway tailored to this personality, 1-2 sentences>",
    "<another>",
    "<another>"
  ],
  "where_this_might_be_hard": [
    "<one honest observation about where this person's personality may resist or struggle with this content's advice, 1-2 sentences>",
    "<another>"
  ],
  "reflection_questions": [
    "<an open-ended question for the user to sit with>",
    "<another>",
    "<another>"
  ],
  "caveat": "<one sentence reminder that this is AI-generated reflection, not professional advice>"
}

Output ONLY the json object."""


USER_PROMPT_TEMPLATE = """User's Big Five profile (0 = low, 1 = high):
{personality_summary}

Article content:
{article_text}

Generate personality-aware reflections in json."""


MAX_ARTICLE_CHARS = 12000  # ~3000 tokens, leaves room for system prompt + output


def _format_personality(personality: dict) -> str:
    sorted_traits = sorted(personality.items(), key=lambda kv: -kv[1])
    lines = []
    for trait, score in sorted_traits:
        if score > 0.7:
            label = "high"
        elif score > 0.55:
            label = "moderate-high"
        elif score > 0.45:
            label = "neutral"
        elif score > 0.3:
            label = "moderate-low"
        else:
            label = "low"
        lines.append(f"  - {trait}: {score:.2f} ({label})")
    return "\n".join(lines)


def apply_to_life(personality: dict, article_text: str) -> dict:
    """Generate personality-aware reflections on an article."""
    if not personality:
        return {"error": "No personality profile provided. Analyze a writing sample first."}
    if not article_text or len(article_text) < 200:
        return {"error": "Article text is too short to analyze meaningfully."}

    # Truncate long articles
    if len(article_text) > MAX_ARTICLE_CHARS:
        article_text = article_text[:MAX_ARTICLE_CHARS] + "\n\n[...truncated...]"

    personality_summary = _format_personality(personality)
    user_prompt = USER_PROMPT_TEMPLATE.format(
        personality_summary=personality_summary,
        article_text=article_text,
    )

    gen = Generator()
    result = gen.generate(SYSTEM_PROMPT, user_prompt, temperature=0.5, max_tokens=2000)

    if "error" in result:
        return {"error": result["error"]}

    # Defensive validation
    required = ["summary", "takeaways_for_you", "where_this_might_be_hard",
                "reflection_questions", "caveat"]
    for field in required:
        if field not in result:
            result[field] = [] if field != "summary" and field != "caveat" else ""

    return result