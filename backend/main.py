from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.personality import PersonalityModel
from models.emotion import EmotionModel
from schemas import AnalyzeRequest, AnalyzeResponse, TextStats

from features.recommender import recommend as run_recommend
from schemas import RecommendRequest, RecommendResponse
from rag.retriever import warm_up

from features.life_advisor import apply_to_life
from schemas import ApplyToLifeRequest, ApplyToLifeResponse

from fastapi import UploadFile, File, Form
from features.content_extractor import (
    extract_from_pdf_bytes,
    extract_from_url,
    normalize_text,
)
MIN_CHARS = 50
models: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[startup] loading personality model...")
    models["personality"] = PersonalityModel()
    print("[startup] loading emotion model...")
    models["emotion"] = EmotionModel()
    print("[startup] warming up KBs...")
    warm_up(["books", "films", "music", "activities"])
    print("[startup] ready")
    yield
    models.clear()


app = FastAPI(title="AI Personality Analyzer", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://ai-personality-analyzer-iota.vercel.app", "https://ai-personality-analyzer-git-main-tajmibhagyas-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": list(models.keys())}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    text = req.text.strip()

    if len(text) < MIN_CHARS:
        return AnalyzeResponse(
            error=f"Text too short. Please provide at least {MIN_CHARS} characters.",
        )

    personality = models["personality"].predict(text)
    emotion = models["emotion"].predict(text)

    return AnalyzeResponse(
        personality=personality,
        emotion=emotion,
        text_stats=TextStats(char_count=len(text), word_count=len(text.split())),
    )
@app.post("/recommend", response_model=RecommendResponse)
def recommend_endpoint(req: RecommendRequest):
    result = run_recommend(
        personality=req.personality,
        medium=req.medium,
        mood=req.mood,
        exclude_ids=req.exclude_ids,
    )
    return RecommendResponse(**result)

@app.post("/extract")
async def extract_endpoint(
    pdf: UploadFile = File(None),
    url: str = Form(None),
    raw_text: str = Form(None),
):
    """Extract clean text from a PDF upload, URL, or raw text paste."""
    text = ""

    if pdf is not None:
        try:
            pdf_bytes = await pdf.read()
            text = extract_from_pdf_bytes(pdf_bytes)
        except Exception as e:
            return {"error": f"Could not parse PDF: {e}", "text": ""}
    elif url:
        text = extract_from_url(url) or ""
        if not text:
            return {"error": "Could not fetch or extract content from URL", "text": ""}
    elif raw_text:
        text = raw_text
    else:
        return {"error": "Provide a pdf, url, or raw_text", "text": ""}

    text = normalize_text(text)

    if len(text) < 200:
        return {"error": "Extracted text is too short (<200 chars).", "text": text}

    return {"text": text, "char_count": len(text)}

@app.post("/apply-to-life", response_model=ApplyToLifeResponse)
def apply_to_life_endpoint(req: ApplyToLifeRequest):
    result = apply_to_life(req.personality, req.article_text)
    if "error" in result:
        return ApplyToLifeResponse(error=result["error"])
    return ApplyToLifeResponse(**result)