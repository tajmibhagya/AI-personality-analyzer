# KB Row Schema

All KBs (books, films, music, travel) follow this row shape:

```json
{
  "id": "<unique_string>",
  "text": "<semantically rich description for embedding>",
  "metadata": { ... type-specific fields ... }
}
```

## `id` format

- Books: `book_0001` through `book_0500`
- Films: `film_0001` through `film_0500`
- Music: `music_0001` through `music_0500`
- Travel: `<city>_<num>`, e.g. `tokyo_001`, `paris_001`

## `text` format (the field FAISS embeds)

Always 100-200 words. Structure:

1. **What it is** — one sentence
2. **Themes / vibe** — 2-3 phrases
3. **Who it suits** — "Suits people who [enjoy X / value Y / are drawn to Z]"

Example (book):

> "Introspective Japanese novel about loneliness, grief, and university life in 1960s
> Tokyo. Slow pacing, philosophical interior monologue, unresolved emotional threads.
> Suits readers who enjoy reflective melancholy, ambiguous endings, and prose that
> prioritizes mood over plot."

Example (travel activity):

> "Immersive digital art museum where visitors walk barefoot through light, water,
> and mirror installations. Sensory novelty, abstract themes, dreamlike atmosphere.
> Suits travelers high in openness who enjoy unconventional sensory experiences."

## `metadata` per type

### Books

```json
{
  "type": "book",
  "title": "Norwegian Wood",
  "author": "Haruki Murakami",
  "year": 1987,
  "genres": ["literary", "coming-of-age"],
  "personality_fit": {
    "openness": "high",
    "conscientiousness": "neutral",
    "extraversion": "low",
    "agreeableness": "neutral",
    "neuroticism": "moderate-high",
    "reasoning": "Introspective and reflective; rewards readers who enjoy interior monologue."
  },
  "source_url": "https://openlibrary.org/works/..."
}
```

### Films

```json
{
  "type": "film",
  "title": "Lost in Translation",
  "director": "Sofia Coppola",
  "year": 2003,
  "genres": ["drama", "romance"],
  "runtime_min": 102,
  "personality_fit": { ... same shape as books ... },
  "source_url": "https://www.themoviedb.org/movie/..."
}
```

### Music

```json
{
  "type": "music",
  "title": "Pyramid Song",
  "artist": "Radiohead",
  "album": "Amnesiac",
  "year": 2001,
  "genres": ["alternative", "art rock"],
  "audio_features": {
    "energy": 0.31,
    "valence": 0.18,
    "danceability": 0.42,
    "acousticness": 0.62
  },
  "personality_fit": { ... },
  "source_url": "https://open.spotify.com/track/..."
}
```

### Activities

```json
{
  "id": "act_0001",
  "text": "<rich description, themes, who-it-suits>",
  "metadata": {
    "type": "activity",
    "name": "Pottery class",
    "category": "creative",
    "indoor_outdoor": "indoor",
    "social_level": "small_group",
    "energy_level": "low",
    "time_commitment": "2-3 hours",
    "where_to_find": "Local pottery studios, community art centers",
    "personality_fit": { ...same shape... }
  }
}
```

## Personality fit labels

Use these exact strings for consistency:

- `"high"` (0.7+)
- `"moderate-high"` (0.55-0.7)
- `"neutral"` (0.45-0.55)
- `"moderate-low"` (0.3-0.45)
- `"low"` (<0.3)
