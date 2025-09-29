# fastapi dev main.py
from fastapi import FastAPI 
from NewDatasetModel.test import predict_texts
from ModelWithContext.Test import predict_texts as pre
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')
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
        label_map = {
            "toxic": "TOXIC",
            "obscene": "OBSCENE",
            "threat": "THREAT",
            "insult": "INSULT",
            "identity_hate": "IDENTITY_HATE"
        }

        # res = [ { "label": "TOXIC", "score": 0.4129 }
        #        , { "label": "INSULT", "score": 0.1494 }
        #        , { "label": "OBSCENE", "score": 0.1051 }
        #        , { "label": "IDENTITY_HATE", "score": 0.0265 } 
        #     ]

        fixed_label = "toxic"
        fixed_score = response[fixed_label]

        # เอา label อื่น ๆ ยกเว้น toxic และ severe_toxic
        other_labels = {k: v for k, v in response.items() if k not in [fixed_label, "severe_toxic"]}
        top3_labels = sorted(other_labels.items(), key=lambda x: x[1], reverse=True)[:3]

        # รวม fixed + top3 พร้อมเปลี่ยนชื่อ
        result = [{"label": label_map[fixed_label], "score": fixed_score}]
        result += [{"label": label_map[k], "score": v} for k, v in top3_labels]

        # แปลงเป็น JSON
        json_result = json.dumps(result, ensure_ascii=False, indent=2)
        return json.loads(json_result)
    
    return {"message" : "Non Toxic"}