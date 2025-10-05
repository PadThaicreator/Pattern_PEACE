from fastapi import FastAPI, HTTPException
import sys
import nltk

# --- ส่วนของการ Import ---
# ⚠️ แก้ไขชื่อไฟล์ตรงนี้ จาก test เป็น testGo
from NewDatasetModel.testGo import predict_with_full_rules 
# ⚠️ แก้ไขชื่อไฟล์ตรงนี้ จาก Test เป็น TestJigsaw
from JigsawModel.TestJigsaw import load_prediction_assets, predict_toxicity

sys.stdout.reconfigure(encoding='utf-8')
app = FastAPI()

# --- ตัวแปร Global ---
jigsaw_model = None
jigsaw_tokenizer = None
jigsaw_thresholds = None

# --- แบ่งกลุ่ม Sentiment/Emotion ---
positive_emotions = ["admiration", "amusement", "approval", "caring", "desire", "excitement", "gratitude", "joy", "love", "optimism", "pride", "relief"]
negative_emotions = ["anger", "annoyance", "disappointment", "disapproval", "disgust", "embarrassment", "fear", "grief", "nervousness", "remorse", "sadness"]
ambiguous_emotions = ["confusion", "curiosity", "realization", "surprise"]
neutral_emotions = ["neutral"]

def initialize_nltk():
    """ตรวจสอบและดาวน์โหลดข้อมูล NLTK ที่จำเป็นตอนเริ่มต้น"""
    required_packages = ['punkt', 'wordnet', 'omw-1.4', 'stopwords']
    print("🚀 Initializing NLTK dependencies...")
    for package in required_packages:
        try:
            if package == 'punkt': nltk.data.find(f'tokenizers/{package}')
            elif package == 'stopwords': nltk.data.find(f'corpora/{package}')
            else: nltk.data.find(f'corpora/{package}.zip')
            print(f"✅ NLTK package '{package}' found.")
        except LookupError:
            print(f"🚨 NLTK package '{package}' not found. Downloading...")
            nltk.download(package, quiet=True)
    print("✅ NLTK is ready.")

@app.on_event("startup")
def startup_event():
    """ทำงานครั้งเดียวตอนที่ FastAPI เริ่มทำงาน"""
    global jigsaw_model, jigsaw_tokenizer, jigsaw_thresholds
    
    initialize_nltk()
    
    print("🚀 Loading Jigsaw toxicity model...")
    try:
        jigsaw_model, jigsaw_tokenizer, jigsaw_thresholds = load_prediction_assets()
        if all((jigsaw_model, jigsaw_tokenizer, jigsaw_thresholds is not None)):
             print("✅ Jigsaw model loaded successfully!")
        else:
             print("🔥 Error loading Jigsaw model!")
    except Exception as e:
        print(f"🔥 A critical error occurred while loading the Jigsaw model: {e}")


@app.get("/analyze")
def analyze_comment(comment: str): 
    text_batch = [comment]
    
    sentiment_result = predict_with_full_rules(comment)
    print("--------------------------------------------------------------------------------")
    print(sentiment_result)
    print("--------------------------------------------------------------------------------")

    toxicity_analysis = {"is_toxic": False, "toxic_types": []}

    # 💡 แก้ไข Logic: ตรวจสอบว่า sentiment ที่ได้ อยู่ในกลุ่ม negative หรือไม่
    if sentiment_result == "negative":
        if not all((jigsaw_model, jigsaw_tokenizer, jigsaw_thresholds is not None)):
            raise HTTPException(
                status_code=503, 
                detail="Toxicity model is not available or failed to load."
            )
        
        toxicity_results = predict_toxicity(text_batch, jigsaw_model, jigsaw_tokenizer, jigsaw_thresholds)
        prediction_dict = toxicity_results[0]['prediction']
        triggered_labels = [label for label, value in prediction_dict.items() if value == 1]
        
        if triggered_labels:
            toxicity_analysis["is_toxic"] = True
            toxicity_analysis["toxic_types"] = triggered_labels

    # 💡 แก้ไข Response: ให้มีโครงสร้าง JSON ที่เหมือนกันเสมอ
    return { 
        "comment": comment, 
        "sentiment_group": sentiment_result,
        "toxicity_analysis": toxicity_analysis
    }

