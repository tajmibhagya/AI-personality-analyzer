import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

client = InferenceClient(token=os.getenv("HF_TOKEN"))

response = client.chat_completion(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[
        {"role": "user", "content": "Reply with exactly: PONG"}
    ],
    max_tokens=10,
)

print(response.choices[0].message.content)