from fastapi import FastAPI 
from NewDatasetModel.test import predict_texts
from ModelWithContext.Test import predict_texts as pre

app = FastAPI()

positive = [
    "admiration",
    "amusement",
    "approval",
    "caring",
    "desire",
    "excitement",
    "gratitude",
    "joy",
    "love",
    "optimism",
    "pride",
    "relief"
]

negative = [
    "anger",
    "annoyance",
    "disappointment",
    "disapproval",
    "disgust",
    "embarrassment",
    "fear",
    "grief",
    "nervousness",
    "remorse",
    "sadness"
]

ambiguous = [
    "confusion",
    "curiosity",
    "realization",
    "surprise"
]

neutral = [
    "neutral"
]


@app.get("/{comment}")
def hello(comment : str):
    text = [comment]
 
    
    
    res = predict_texts(text)
    max_key = max(res, key=res.get)

    if(max_key in negative):
        return max_key
    
    return {"message" : res}