from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.personality import PersonalityModel
from models.emotion import EmotionModel
from schemas import AnalyzeRequest, AnalyzeResponse, TextStats

MIN_CHARS = 50
models: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[startup] loading personality model...")
    models["personality"] = PersonalityModel()
    print("[startup] loading emotion model...")
    models["emotion"] = EmotionModel()
    print("[startup] ready")
    yield
    models.clear()


app = FastAPI(title="AI Personality Analyzer", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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