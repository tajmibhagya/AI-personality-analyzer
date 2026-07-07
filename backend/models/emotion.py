from transformers import pipeline


class EmotionModel:
    """7-class emotion classifier: anger, disgust, fear, joy, neutral, sadness, surprise."""

    def __init__(self, model_name: str = "j-hartmann/emotion-english-distilroberta-base"):
        self.pipe = pipeline("text-classification", model=model_name, top_k=None)

    def predict(self, text: str) -> dict:
        # The model's max sequence is 512 tokens; rough char cap to avoid tokenizer warnings.
        text = text[:1500]
        results = self.pipe(text)[0]  # [{'label': ..., 'score': ...}, ...]
        return {r["label"]: round(float(r["score"]), 4) for r in results}