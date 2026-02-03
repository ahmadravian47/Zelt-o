# python/sentiment.py
import sys
import json
from transformers import pipeline

# Load model ONCE
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

def analyze(messages):
    if not messages:
        return "neutral"

    text = " ".join(messages)
    result = sentiment_analyzer(text)[0]

    label = result["label"]
    score = result["score"]

    if label == "POSITIVE" and score > 0.6:
        return "positive"
    elif label == "NEGATIVE" and score > 0.6:
        return "negative"
    return "neutral"

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    messages = data.get("messages", [])
    sentiment = analyze(messages)

    print(json.dumps({ "sentiment": sentiment }))
