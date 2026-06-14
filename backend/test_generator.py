from rag.generator import Generator

gen = Generator()

system = """You are a helpful assistant. Reply with JSON in this exact shape:
{
  "answer": "<one-sentence answer>",
  "confidence": <number between 0 and 1>
}"""

user = "What's the capital of France?"

result = gen.generate(system, user)
print(result)