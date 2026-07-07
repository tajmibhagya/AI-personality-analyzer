import httpx
"""
Generator: takes a prompt + retrieved chunks, returns structured JSON.

Uses Groq's OpenAI-compatible API with Llama 3.1 8B.

Groq is free, fast, and has a stable model catalog. We use the OpenAI SDK
pointed at Groq's endpoint — it's a drop-in replacement.
"""

import json
import os
import re

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


class Generator:
    """Wraps the Groq LLM call. Returns parsed JSON."""

    _instance = None

    def __new__(cls, model: str = "llama-3.1-8b-instant"):
        if cls._instance is None or not hasattr(cls._instance, "client"):

            cls._instance = super().__new__(cls)
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise RuntimeError("GROQ_API_KEY missing — check your backend/.env file")
            cls._instance.client = OpenAI(
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1",
                http_client=httpx.Client(),
            )
            cls._instance.model = model
            print(f"[Generator] Ready with Groq + {model}")
        return cls._instance

    @staticmethod
    def _extract_json(text: str) -> dict:
        """Pull JSON out of the model's response, defensively.

        Handles bare JSON, fenced JSON, and JSON embedded in chatter.
        """
        text = text.strip()

        # Strip markdown code fences if present
        fence_pattern = r"^```(?:json)?\s*(.*?)\s*```$"
        match = re.match(fence_pattern, text, re.DOTALL)
        if match:
            text = match.group(1).strip()

        # If still not pure JSON, find the outermost {...}
        if not text.startswith("{"):
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                text = text[start:end + 1]

        return json.loads(text)

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.4,
        max_tokens: int = 1500,
    ) -> dict:
        """Call the LLM and return parsed JSON."""
        reinforced_system = system_prompt + (
            "\n\nCRITICAL: Respond with ONLY valid JSON. No markdown fences, "
            "no preamble, no commentary. Just the raw JSON object."
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": reinforced_system},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},  # Groq supports JSON mode
            )
            raw = response.choices[0].message.content
        except Exception as e:
            print(f"[Generator] API error: {e}")
            return {"error": f"LLM call failed: {str(e)}"}

        try:
            return self._extract_json(raw)
        except json.JSONDecodeError as e:
            print(f"[Generator] JSON parse error: {e}")
            print(f"[Generator] Raw response was:\n{raw}")
            return {"error": "Model returned invalid JSON", "raw": raw}