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