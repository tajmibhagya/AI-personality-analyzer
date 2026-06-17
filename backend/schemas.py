from pydantic import BaseModel, Field
from typing import Optional, Dict


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)


class TextStats(BaseModel):
    char_count: int
    word_count: int


class AnalyzeResponse(BaseModel):
    personality: Optional[Dict[str, float]] = None
    emotion: Optional[Dict[str, float]] = None
    text_stats: Optional[TextStats] = None
    error: Optional[str] = None


class Recommendation(BaseModel):
    id: str
    title: str
    why: str
    trait_drivers: list[str] = Field(
        default_factory=list,
        description="Which Big Five traits drove this match"
    )
    metadata: dict = Field(default_factory=dict)


class RecommendRequest(BaseModel):
    personality: dict[str, float]
    medium: str  # "books" | "films" | "music" | "activities"
    mood: Optional[str] = None
    exclude_ids: list[str] = Field(default_factory=list)


class RecommendResponse(BaseModel):
    medium: str
    recommendations: list[Recommendation] = Field(default_factory=list)
    error: Optional[str] = None