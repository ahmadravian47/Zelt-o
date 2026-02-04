from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv() 
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

completion = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {"role": "user", "content": "Explain how streaming LLM responses work in a short way"}
    ],
    stream=True,
)
completion = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {"role": "user", "content": "Explain how streaming LLM responses work"}
    ],
    stream=True,
    max_completion_tokens=100,
    temperature=0.6,
    top_p=0.9,
    presence_penalty=0.3,
    frequency_penalty=0.2,
)
for chunk in completion:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
