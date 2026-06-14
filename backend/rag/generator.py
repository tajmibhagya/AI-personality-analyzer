"""
Generator: takes a prompt + retrieved chunks, returns structured JSON.

Uses HuggingFace's Inference API with Qwen2.5-7B-Instruct.

Unlike OpenAI, HF doesn't have a native JSON mode. We:
1. Strongly instruct the model to return only JSON in the prompt
2. Strip code fences and stray text from the response
3. Parse defensively with a retry on JSON failure
"""

import json
import os
import re
import time

from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()


class Generator:
    """Wraps a HuggingFace LLM call. Returns parsed JSON."""

    _instance = None

    def __new__(cls, model: str = "Qwen/Qwen2.5-7B-Instruct"):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            token = os.getenv("HF_TOKEN")
            if not token:
                raise RuntimeError("HF_TOKEN missing — check your backend/.env file")
            cls._instance.client = InferenceClient(token=token)
            cls._instance.model = model
            print(f"[Generator] Ready with {model}")
        return cls._instance

    def _call_with_retry(
        self,
        messages: list[dict],
        temperature: float,
        max_tokens: int,
        max_retries: int = 3,
    ) -> str:
        """Call HF Inference API with retries for 'model loading' errors."""
        last_err = None
        for attempt in range(max_retries):
            try:
                response = self.client.chat_completion(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                return response.choices[0].message.content

            except Exception as e:
                last_err = e
                err_str = str(e).lower()
                # HF returns "currently loading" on cold-start; retry after a wait
                if "loading" in err_str or "503" in err_str:
                    wait = 10 * (attempt + 1)  # 10s, 20s, 30s
                    print(f"[Generator] Model loading, retrying in {wait}s "
                          f"(attempt {attempt + 1}/{max_retries})...")
                    time.sleep(wait)
                    continue
                # Other errors: re-raise immediately
                raise

        raise RuntimeError(f"Max retries exceeded. Last error: {last_err}")

    @staticmethod
    def _extract_json(text: str) -> dict:
        """Pull JSON out of the model's response, defensively.

        Handles:
        - Bare JSON: {"key": "value"}
        - Fenced JSON: ```json\n{"key": "value"}\n```
        - JSON embedded in chatter: "Sure! Here's the JSON: {...}"
        """
        # Strip whitespace
        text = text.strip()

        # Remove markdown code fences if present
        # Matches ```json...``` or ```...```
        fence_pattern = r"^```(?:json)?\s*(.*?)\s*```$"
        match = re.match(fence_pattern, text, re.DOTALL)
        if match:
            text = match.group(1).strip()

        # If still not pure JSON, find the first { and last } and extract between
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
        """Call the LLM and return parsed JSON.

        Args:
            system_prompt: behavior instructions. Must clearly request JSON output.
            user_prompt: the actual request.
            temperature: 0.0 = deterministic, 1.0 = creative. 0.3-0.5 for structured output.
            max_tokens: cap on response length.

        Returns:
            Parsed JSON as a Python dict, or {"error": "...", "raw": "..."} on failure.
        """
        # Reinforce JSON requirement at the end of the system prompt for safety
        reinforced_system = system_prompt + (
            "\n\nCRITICAL: Respond with ONLY valid JSON. No markdown fences, "
            "no preamble, no commentary. Just the raw JSON object."
        )

        messages = [
            {"role": "system", "content": reinforced_system},
            {"role": "user", "content": user_prompt},
        ]

        try:
            raw = self._call_with_retry(messages, temperature, max_tokens)
        except Exception as e:
            print(f"[Generator] API error: {e}")
            return {"error": f"LLM call failed: {str(e)}"}

        try:
            return self._extract_json(raw)
        except json.JSONDecodeError as e:
            print(f"[Generator] JSON parse error: {e}")
            print(f"[Generator] Raw response was:\n{raw}")
            return {"error": "Model returned invalid JSON", "raw": raw}