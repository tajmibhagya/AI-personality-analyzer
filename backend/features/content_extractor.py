"""
Extract clean text from PDF, URL, or raw text input.
"""
import io
from typing import Optional

import requests
from pypdf import PdfReader
import trafilatura


MAX_TEXT_CHARS = 50000  # ~12k tokens — fits comfortably in LLM context


def extract_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract text from a PDF given as raw bytes."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages = []
    for page in reader.pages:
        text = page.extract_text() or ""
        pages.append(text)
    return "\n\n".join(pages).strip()


def extract_from_url(url: str) -> Optional[str]:
    """Fetch a URL and extract the main article text. Returns None on failure."""
    try:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return None
        return trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=False,
            favor_recall=True,
        )
    except Exception as e:
        print(f"[extract_from_url] error: {e}")
        return None


def normalize_text(text: str) -> str:
    """Clean up extracted text — collapse whitespace, cap length."""
    if not text:
        return ""
    # Collapse multiple newlines/spaces
    lines = [line.strip() for line in text.splitlines()]
    lines = [line for line in lines if line]
    cleaned = "\n".join(lines)
    if len(cleaned) > MAX_TEXT_CHARS:
        cleaned = cleaned[:MAX_TEXT_CHARS] + "\n\n[...truncated...]"
    return cleaned