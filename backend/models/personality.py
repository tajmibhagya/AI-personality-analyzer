import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Order matches the model's output head. If you swap models, update this list.
TRAIT_LABELS = [
    "Extraversion",
    "Neuroticism",
    "Agreeableness",
    "Conscientiousness",
    "Openness",
]


class PersonalityModel:
    """
    Wraps a Big Five personality classifier.

    Default model outputs 5 continuous values in roughly [0, 1].
    Verify with a few sample inputs on day 1 — if your model emits raw
    logits, set `apply_sigmoid=True`.
    """

    def __init__(
        self,
        model_name: str = "Minej/bert-base-personality",
        apply_sigmoid: bool = False,
    ):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.model.eval()
        self.apply_sigmoid = apply_sigmoid

    @torch.no_grad()
    def predict(self, text: str) -> dict:
        inputs = self.tokenizer(
            text,
            truncation=True,
            padding=True,
            return_tensors="pt",
            max_length=512,
        )
        outputs = self.model(**inputs)
        logits = outputs.logits.squeeze()
        if self.apply_sigmoid:
            logits = torch.sigmoid(logits)
        scores = logits.tolist()
        if not isinstance(scores, list):
            scores = [scores]
        return {label: round(float(s), 4) for label, s in zip(TRAIT_LABELS, scores)}