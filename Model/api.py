# fastapi dev main.py
from fastapi import FastAPI 
from NewDatasetModel.test import predict_texts
from ModelWithContext.Test import predict_texts as pre
import json
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
        response = pre(comment)
        fixed_label = "toxic"
        fixed_score = response[fixed_label]

        # เอา label อื่น ๆ มาจัดเรียงตาม score
        other_labels = {k: v for k, v in response.items() if k != fixed_label}
        top_labels = sorted(other_labels.items(), key=lambda x: x[1], reverse=True)[:3]  # top3 นอก toxic

        # รวม fixed + top3
        result = [{"label": fixed_label, "score": fixed_score}]
        result += [{"label": k, "score": v} for k, v in top_labels]

        # แปลงเป็น JSON string
        json_result = json.dumps(result, ensure_ascii=False, indent=2)
        return json.loads(json_result)
    
    return {"message" : "Non Toxic"}