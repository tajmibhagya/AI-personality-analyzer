---
title: MindProfile AI Backend
emoji: 🧠
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

<div align="center">

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi" />
<img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python" />
<img src="https://img.shields.io/badge/HuggingFace-Spaces-FFD21E?style=for-the-badge&logo=huggingface" />
<img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />

# MindProfile AI

**Full-stack AI personality analyzer. Paste your writing — get your Big Five profile, personalized recommendations, and an LLM reflection engine.**

[🔗 Live Demo](https://ai-personality-analyzer-iota.vercel.app) · [📁 GitHub](https://github.com/tajmibhagya/AI-personality-analyzer) · [🤗 HuggingFace Space](https://huggingface.co/spaces/Tajmi/mindprofile-backend)

</div>

---

## Overview

MindProfile AI estimates Big Five personality traits from natural prose using a fine-tuned BERT model, then uses those scores to drive a complete personalization pipeline — RAG-based recommendations, LLM reflections on uploaded content, and a downloadable PDF personality report.

Most personality tools give a generic label. This one reads how you write and filters everything downstream through your actual trait scores.

---

## Live Demo

| Layer       | URL                                             |
| ----------- | ----------------------------------------------- |
| Frontend    | https://ai-personality-analyzer-iota.vercel.app |
| Backend API | https://tajmi-mindprofile-backend.hf.space      |
| API Docs    | https://tajmi-mindprofile-backend.hf.space/docs |

---

## Features

### 🧠 Big Five Personality Analysis

- Accepts any natural English prose (100+ words recommended)
- Fine-tuned BERT model (`Minej/bert-base-personality`) outputs raw logits per trait
- Sigmoid normalization maps logits to calibrated 0–100% scores
- Five traits: **Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism**
- Visualized as an interactive radar chart and individual trait bars with level labels (High / Moderate-High / Average / Moderate-Low / Low)

### 😐 Emotion Detection

- 7-class emotion classifier (`j-hartmann/emotion-english-distilroberta-base`)
- Classes: anger, disgust, fear, joy, neutral, sadness, surprise
- Displayed alongside personality as a ranked emotion breakdown
- Mood-personality crossover insight generated on the Discover page

### ✨ RAG Recommendations

- 519-item curated knowledge base across 4 mediums: **books, films, music, activities**
- Sentence-transformer embeddings (`all-MiniLM-L6-v2`) stored in FAISS IndexFlatIP
- At query time: user personality + mood → semantic search → top-k candidates → Groq LLM reranking with personality-aware "why" generation
- Mood filter (reflective / uplifting / intense / playful) applied at retrieval
- Shuffle ("show me different ones") excludes previously seen IDs
- Platform links: books → Goodreads, films → IMDb, music → Spotify

### 💡 Apply to My Life

- Accepts PDF upload, URL, or pasted text
- `/extract` endpoint normalizes any input format to clean text
- Extracted text + user's Big Five profile sent to Groq (Llama 3.1 8B) with a structured system prompt
- Returns 4-section JSON: summary, takeaways for you, where this might be hard, reflection questions
- Caveat included: not therapeutic advice

### 📄 PDF Report Generation

- 4-page PDF generated entirely in-browser via `@react-pdf/renderer`
- Page 1: Cover with branding and generation date
- Page 2: Big Five scores with colored bars, trait images, and a custom SVG radar chart computed from polygon geometry
- Page 3: Apply-to-life reflection (summary, takeaways, blind spots, reflection questions)
- Page 4: Personalized recommendations across all 4 mediums
- One-click download — no server round-trip

### 🔍 Discover Page

- **Profile rarity score** — compares user's Big Five to population averages, shows deviation as a percentage
- **Communication style** — derives style label, motivator, and friction source from trait thresholds
- **Right now insight** — crosses current dominant emotion with Big Five for a situational recommendation
- **Trait breakdown** — animated horizontal bars with per-trait colors
- **Creative IQ Challenge** — 10-question timed game (30 seconds), patterns / analogies / word links / visual, result label crossed with personality profile

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Vercel)                   │
│  Next.js 16 · React 19 · TypeScript · Tailwind CSS v4  │
│  Zustand (persistent state) · Recharts · react-pdf      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS API calls
┌────────────────────────▼────────────────────────────────┐
│                  BACKEND (HuggingFace Spaces)           │
│                    FastAPI · Python 3.11                │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ PersonalityModel│  │  EmotionModel   │              │
│  │ BERT fine-tuned │  │ DistilRoBERTa   │              │
│  │ → sigmoid norm  │  │ → 7-class softmax│             │
│  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                        │
│  ┌────────▼────────────────────▼────────┐              │
│  │              RAG Pipeline            │              │
│  │                                      │              │
│  │  Query → Embedder (MiniLM-L6-v2)    │              │
│  │       → FAISS IndexFlatIP search    │              │
│  │       → Groq Llama 3.1 8B rerank   │              │
│  │       → Structured JSON response   │              │
│  └──────────────────────────────────────┘              │
│                                                         │
│  ┌───────────────────────────────────────┐             │
│  │          Content Extractor            │             │
│  │  PDF → text · URL → trafilatura      │             │
│  │  raw text → truncate → apply-to-life │             │
│  └───────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## ML Pipeline

### Personality Inference

```
Input text
    │
    ▼
Tokenize (BERT tokenizer, max 512 tokens)
    │
    ▼
BERT forward pass → 5 raw logits
[Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism]
    │
    ▼
Sigmoid normalization → values in [0, 1]
    │
    ▼
Threshold classification → High / Moderate-High / Average / Moderate-Low / Low
```

### RAG Recommendation Pipeline

```
User personality + medium + mood
    │
    ▼
Format personality summary (trait → label string)
    │
    ▼
Embed query via sentence-transformers (all-MiniLM-L6-v2, dim=384)
    │
    ▼
FAISS IndexFlatIP cosine similarity search → top-k candidates
    │
    ▼
Groq Llama 3.1 8B prompt:
  "Given personality [X], recommend from these candidates [Y],
   explain why each fits, return JSON"
    │
    ▼
Structured response: [{title, why, trait_drivers, metadata}]
```

### Apply-to-Life Pipeline

```
Input (PDF / URL / raw text)
    │
    ▼
/extract → clean text (trafilatura for URLs, pypdf for PDFs)
    │
    ▼
Truncate to 12,000 chars (~3,000 tokens)
    │
    ▼
Format: personality summary + article text → Groq prompt
    │
    ▼
Llama 3.1 8B → strict JSON:
{
  summary, takeaways_for_you[],
  where_this_might_be_hard[],
  reflection_questions[], caveat
}
    │
    ▼
Persist to Zustand store → available in PDF report
```

---

## Tech Stack

### Backend

| Component         | Technology                                         |
| ----------------- | -------------------------------------------------- |
| API framework     | FastAPI 0.100+                                     |
| Language          | Python 3.11                                        |
| Personality model | `Minej/bert-base-personality` (HuggingFace)        |
| Emotion model     | `j-hartmann/emotion-english-distilroberta-base`    |
| Embeddings        | `sentence-transformers/all-MiniLM-L6-v2` (dim=384) |
| Vector store      | FAISS `IndexFlatIP`                                |
| LLM               | Groq API · Llama 3.1 8B Instant                    |
| Text extraction   | trafilatura (URL) · pypdf (PDF)                    |
| HTTP client       | httpx (explicit client to bypass proxy issues)     |
| Containerization  | Docker (python:3.11-slim)                          |
| Hosting           | HuggingFace Spaces (CPU basic, free tier)          |

### Frontend

| Component         | Technology                                      |
| ----------------- | ----------------------------------------------- |
| Framework         | Next.js 16.2 (App Router, Turbopack)            |
| UI library        | React 19                                        |
| Language          | TypeScript                                      |
| Styling           | Tailwind CSS v4 (@theme directive)              |
| Component library | shadcn/ui (New York/Slate)                      |
| State management  | Zustand 5 + localStorage persistence            |
| Charts            | Recharts (radar, bar)                           |
| PDF generation    | @react-pdf/renderer (custom SVG radar, 4 pages) |
| Fonts             | Plus Jakarta Sans, Space Grotesk                |
| Hosting           | Vercel (automatic GitHub deployment)            |

### Knowledge Base

| Medium     | Items   | Source                                |
| ---------- | ------- | ------------------------------------- |
| Books      | 193     | Enriched via OpenAI + manual curation |
| Films      | 108     | TMDB API + enrichment                 |
| Music      | 98      | LastFM API + enrichment               |
| Activities | 120     | Custom generation                     |
| **Total**  | **519** |                                       |

---

## API Endpoints

### `POST /analyze`

Estimates Big Five personality and emotional tone from text.

**Request:**

```json
{ "text": "string (100+ words of natural prose)" }
```

**Response:**

```json
{
  "personality": {
    "Openness": 0.54,
    "Conscientiousness": 0.43,
    "Extraversion": 0.53,
    "Agreeableness": 0.47,
    "Neuroticism": 0.53
  },
  "emotion": {
    "joy": 0.42,
    "neutral": 0.31,
    "sadness": 0.12,
    "anger": 0.08,
    "fear": 0.04,
    "disgust": 0.02,
    "surprise": 0.01
  },
  "text_stats": { "char_count": 847, "word_count": 142 }
}
```

### `POST /recommend`

Returns 3 personality-matched recommendations for a given medium.

**Request:**

```json
{
  "personality": { "Openness": 0.54, ... },
  "medium": "books | films | music | activities",
  "mood": "reflective | uplifting | intense | playful | null",
  "exclude_ids": ["books_012", "books_047"]
}
```

### `POST /extract`

Extracts clean text from PDF, URL, or raw text.

**Request:** `multipart/form-data` with `pdf`, `url`, or `raw_text`

**Response:**

```json
{ "text": "extracted content...", "char_count": 4823 }
```

### `POST /apply-to-life`

Generates personality-aware reflection on provided content.

**Request:**

```json
{
  "personality": { "Openness": 0.54, ... },
  "article_text": "string"
}
```

**Response:**

```json
{
  "summary": "string",
  "takeaways_for_you": ["string", ...],
  "where_this_might_be_hard": ["string", ...],
  "reflection_questions": ["string", ...],
  "caveat": "string"
}
```

### `GET /health`

```json
{ "status": "ok", "models_loaded": ["personality", "emotion"] }
```

---

## Project Structure

```
AI-personality-analyzer/
├── backend/
│   ├── main.py                    # FastAPI app, endpoints, lifespan
│   ├── schemas.py                 # Pydantic request/response models
│   ├── models/
│   │   ├── personality.py         # BERT wrapper + sigmoid normalization
│   │   └── emotion.py             # DistilRoBERTa wrapper
│   ├── rag/
│   │   ├── embedder.py            # sentence-transformers wrapper
│   │   ├── vector_store.py        # FAISS IndexFlatIP build + search
│   │   ├── retriever.py           # Multi-KB retrieval + warm-up
│   │   └── generator.py           # Groq LLM client + JSON parsing
│   ├── features/
│   │   ├── recommender.py         # Recommendation pipeline orchestrator
│   │   ├── life_advisor.py        # Apply-to-life prompt + Groq call
│   │   ├── content_extractor.py   # PDF/URL/text extraction
│   │   └── title_resolver.py      # TMDB/LastFM title enrichment
│   ├── data/recommender/          # JSONL knowledge bases (519 items)
│   ├── index_store/               # Pre-built FAISS indexes (Git LFS)
│   ├── requirements.txt
│   └── .env                       # GROQ_API_KEY, TMDB_API_KEY (not committed)
├── frontend-next/
│   ├── src/
│   │   ├── app/                   # Next.js App Router pages
│   │   │   ├── page.tsx           # Home - Big Five trait cards
│   │   │   ├── analyzer/          # Text input + radar + emotion
│   │   │   ├── recommendations/   # Medium/mood filter + RAG cards
│   │   │   ├── upload/            # PDF/URL/text + reflection output
│   │   │   └── discover/          # Insights + IQ game + streak
│   │   ├── components/
│   │   │   ├── dashboard/         # TraitInsightCard, SideQuickActions
│   │   │   ├── recommendations/   # MediumSelector, MoodSelector, Card
│   │   │   ├── upload/            # ReflectionDisplay
│   │   │   ├── pdf/               # PDFDocument, DownloadReportButton
│   │   │   ├── discover/          # CreativeIQGame
│   │   │   └── layout/            # AppLayout, Container, Footer
│   │   └── lib/
│   │       ├── api.ts             # Typed fetch wrappers for all endpoints
│   │       ├── store/personality.ts # Zustand store (personality + reflection)
│   │       └── mock-dashboard.ts  # Sample data for unauthenticated state
│   ├── public/traits/             # Trait images (openness.jpeg, etc.)
│   └── next.config.ts
├── Dockerfile                     # HuggingFace Spaces Docker config
├── .dockerignore
└── README.md
```

---

## Local Development

### Backend

```bash
cd AI-personality-analyzer/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Create .env
echo "GROQ_API_KEY=your_key_here" > .env
echo "TMDB_API_KEY=your_key_here" >> .env

# Build FAISS indexes (first time only)
python data/recommender/build_indexes.py

# Start server
python -m uvicorn main:app --reload --port 8001
```

Backend runs at `http://127.0.0.1:8001`. Interactive API docs at `http://127.0.0.1:8001/docs`.

### Frontend

```bash
cd AI-personality-analyzer/frontend-next
npm install

# Point at local backend
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8001" > .env.local

npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## Deployment

### Backend → HuggingFace Spaces

```bash
# Add HF remote
git remote add space https://huggingface.co/spaces/Tajmi/mindprofile-backend

# Push
git push space main
```

Add `GROQ_API_KEY` and `TMDB_API_KEY` as secrets in Space Settings → Variables and secrets.

Build time: ~10–15 minutes (model downloads). First cold start after sleep: ~30 seconds.

### Frontend → Vercel

1. Import GitHub repo at vercel.com/new
2. Set **Root Directory** to `frontend-next`
3. Add environment variable: `NEXT_PUBLIC_API_URL` = HuggingFace Space URL
4. Deploy

Vercel auto-deploys on every push to `main`.

---

## Key Design Decisions

**Why sigmoid normalization?**
BERT outputs raw logits (can be negative or >1). Sigmoid maps them to [0,1] without losing relative ordering, giving calibrated percentages that compare meaningfully across traits and users.

**Why FAISS IndexFlatIP over approximate indexes?**
The knowledge base is 519 items — small enough that exact search is fast (<5ms) and more accurate than approximate methods. No need for IVF or HNSW at this scale.

**Why Groq + Llama 3.1 8B over direct embedding ranking?**
Embedding similarity finds semantically close items but cannot reason about _why_ a book suits a specific personality combination. The LLM step generates the "why" explanation and can weight trait combinations that pure cosine similarity misses.

**Why @react-pdf/renderer over server-side PDF?**
The report includes user-specific personality data stored in localStorage. Generating client-side avoids sending sensitive data to a server and makes the download instant with no backend round-trip.

**Why Zustand over Redux/Context?**
Lightweight, minimal boilerplate, built-in `persist` middleware for localStorage sync. The store shape is simple (personality + emotion + reflection + recommendations) — overkill to use Redux.

---

## Limitations

- Personality model is probabilistic, not diagnostic. Correlates moderately with self-report (r ≈ 0.3–0.5 in literature).
- Best with 100+ words of natural English prose. Short or non-English text reduces accuracy.
- HuggingFace Space sleeps after 48 hours of inactivity. First request after sleep takes ~30 seconds while models reload.
- Groq rate limits apply on the free tier. High concurrent usage may result in delayed responses.
- FAISS indexes are pre-built and stored via Git LFS. Adding new knowledge base items requires rebuilding locally and pushing.

---

## Release History

| Tag                         | Description                                       |
| --------------------------- | ------------------------------------------------- |
| `v0.6-next-scaffold`        | Next.js 16 scaffold with FastAPI health check     |
| `v0.7-next-nav-shell`       | Top nav, mega menu, theme toggle                  |
| `v0.8-next-dashboard`       | Dashboard with Big Five trait cards               |
| `v0.9-next-analyzer`        | Analyzer with radar chart and Zustand state       |
| `v1.0-next-recommendations` | RAG recommendations with medium/mood filter       |
| `v1.1-next-apply`           | Apply-to-life pipeline, 3-mode input              |
| `v1.5-discover`             | Discover page, Creative IQ game                   |
| `v1.6-pdf-recommendations`  | PDF page 4 with recommendations                   |
| `v1.7-deployed`             | First public deployment                           |
| `v2.0-fully-deployed`       | All features live, title resolver, platform links |
| `v2.1-polished`             | Sidebar rename, header tagline, full-width tabs   |

---

## Author

**Razor Sharp (Tajmi Bhagya Senevirathna)**
Final Year · BSc in Information Technology
University of Moratuwa 🇱🇰

[LinkedIn](https://linkedin.com/in/tajmibhagya) · [GitHub](https://github.com/tajmibhagya)

---

## License

MIT — see [LICENSE](LICENSE) for details.

_Not a therapist or career coach. A thinking partner that knows your personality._
