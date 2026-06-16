"""
Generate the activities KB by asking the LLM to draft activities per category.

Unlike books/films/music, we don't have an external API source — we curate
categories, then the LLM proposes activities within each.
"""
import json
import os
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from rag.generator import Generator

OUTPUT = "data/recommender/activities.jsonl"
CACHE = "data/recommender/_activities_cache.jsonl"

# Categories chosen for personality variety.
# Each will yield ~8 activities → ~120 total.
CATEGORIES = [
    ("creative_solo", "Solo creative pursuits (writing, painting, music-making, photography)"),
    ("creative_group", "Group creative activities (improv, choir, dance class, art collective)"),
    ("active_outdoor", "Physically active outdoor activities (hiking, climbing, surfing, cycling)"),
    ("active_team", "Team sports and group physical activities"),
    ("contemplative", "Quiet introspective activities (meditation, journaling, solo walks, sketching)"),
    ("social_casual", "Low-key social activities (coffee meetups, board game nights, potlucks)"),
    ("social_high_energy", "High-energy social activities (parties, concerts, festivals, clubs)"),
    ("intellectual", "Mind-engaging activities (book clubs, lectures, debates, courses, museums)"),
    ("sensory_experiential", "Sensory-rich experiences (wine tasting, immersive art, perfumery, food crawls)"),
    ("nature_immersion", "Deep nature experiences (camping, birding, foraging, stargazing)"),
    ("skill_building", "Structured learning (instrument lessons, coding bootcamp, language class)"),
    ("adventure_risk", "Higher-thrill adventures (skydiving, rock climbing, scuba diving, solo travel)"),
    ("wellness", "Self-care and wellness (spa, yoga retreat, breathwork, therapy work)"),
    ("hobby_collecting", "Collecting and hobby-craft (gardening, model building, brewing, woodworking)"),
    ("volunteering_service", "Service and community involvement (volunteering, mentoring, activism)"),
]

ACTIVITIES_PER_CATEGORY = 8

SYSTEM_PROMPT = """You are an expert lifestyle curator and personality psychologist.

Given an activity category, generate a list of distinct, real activities people can do.
For each activity, return rich enrichment data.

Return JSON with this exact shape:

{
  "activities": [
    {
      "name": "<short clear name>",
      "indoor_outdoor": "<indoor|outdoor|either>",
      "social_level": "<solo|small_group|crowd>",
      "energy_level": "<low|medium|high>",
      "time_commitment": "<rough time, e.g. '1-2 hours', 'half day', 'multi-week'>",
      "where_to_find": "<where someone could look in their area>",
      "text": "<100-180 words: WHAT IT IS (one sentence) + VIBE/THEMES (2-3 phrases) + 'Suits people who...' (one sentence)>",
      "personality_fit": {
        "openness": "<high|moderate-high|neutral|moderate-low|low>",
        "conscientiousness": "<same>",
        "extraversion": "<same>",
        "agreeableness": "<same>",
        "neuroticism": "<same>",
        "reasoning": "<one sentence on the main personality match>"
      }
    },
    ... etc
  ]
}

IMPORTANT:
- Each activity must be DISTINCT from the others in the list.
- Mix common and slightly-uncommon activities (don't only suggest the obvious ones).
- Be honest about personality fit — not every activity is "high in everything."
- Use specific names ("Sourdough baking" not "Cooking", "Trail running" not "Exercise")."""


def load_cache():
    cache = {}
    if not os.path.exists(CACHE):
        return cache
    with open(CACHE) as f:
        for line in f:
            row = json.loads(line)
            cache[row["category"]] = row["activities"]
    return cache


def save_to_cache(category, activities):
    with open(CACHE, "a") as f:
        f.write(json.dumps({"category": category, "activities": activities}) + "\n")


def main():
    gen = Generator()
    cache = load_cache()
    print(f"[activities] {len(cache)} categories cached")

    all_rows = []
    counter = 0

    for cat_key, cat_description in CATEGORIES:
        if cat_key in cache:
            activities = cache[cat_key]
            print(f"[cache] {cat_key} ({len(activities)} activities)")
        else:
            print(f"[gen] Generating {ACTIVITIES_PER_CATEGORY} activities for: {cat_key}")
            user = (
                f"Category: {cat_key}\n"
                f"Description: {cat_description}\n"
                f"Generate {ACTIVITIES_PER_CATEGORY} distinct activities for this category.\n"
                "Return JSON."
            )
            result = gen.generate(SYSTEM_PROMPT, user, temperature=0.6, max_tokens=3500)
            if "error" in result or "activities" not in result:
                print(f"  ✗ failed: {result.get('error', 'no activities key')}")
                continue
            activities = result["activities"]
            save_to_cache(cat_key, activities)
            time.sleep(0.5)

        for act in activities:
            counter += 1
            # Skip malformed entries
            if not act.get("name") or not act.get("text") or not act.get("personality_fit"):
                continue
            row = {
                "id": f"act_{counter:04d}",
                "text": act["text"],
                "metadata": {
                    "type": "activity",
                    "name": act["name"],
                    "category": cat_key,
                    "indoor_outdoor": act.get("indoor_outdoor"),
                    "social_level": act.get("social_level"),
                    "energy_level": act.get("energy_level"),
                    "time_commitment": act.get("time_commitment"),
                    "where_to_find": act.get("where_to_find"),
                    "personality_fit": act["personality_fit"],
                },
            }
            all_rows.append(row)

    with open(OUTPUT, "w") as f:
        for row in all_rows:
            f.write(json.dumps(row) + "\n")
    print(f"\nWrote {len(all_rows)} activities to {OUTPUT}")


if __name__ == "__main__":
    main()