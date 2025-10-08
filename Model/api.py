from fastapi import FastAPI, HTTPException
import sys
import nltk

from NewDatasetModel.testGo import predict_with_full_rules 
from JigsawModel.TestJigsaw import load_prediction_assets, predict_and_explain

sys.stdout.reconfigure(encoding='utf-8')
app = FastAPI()

jigsaw_model = None
jigsaw_tokenizer = None
jigsaw_thresholds = None


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
             print(" Jigsaw model loaded successfully!")
        else:
             print(" Error loading Jigsaw model!")
    except Exception as e:
        print(f" A critical error occurred while loading the Jigsaw model: {e}")


@app.get("/analyze")
def analyze_comment(comment: str): 
    text_batch = [comment]
    
    sentiment_result = predict_with_full_rules(comment)
    print("--------------------------------------------------------------------------------")
    print(f"Sentiment Result: {sentiment_result}")
    print("--------------------------------------------------------------------------------")

    # ✨ 1. เพิ่ม key 'explanation' เข้าไปในโครงสร้างเริ่มต้น
    toxicity_analysis = {
        "is_toxic": False, 
        "toxic_types": [],
        "explanation": []  # เพิ่ม key นี้เข้าไป
    }
    
    if sentiment_result == "negative":
        if not all((jigsaw_model, jigsaw_tokenizer, jigsaw_thresholds)):
            raise HTTPException(
                status_code=503, 
                detail="Toxicity model is not available or failed to load."
            )
        
        # ✨ 2. เปลี่ยนไปเรียกใช้ฟังก์ชันใหม่ predict_and_explain
        # สมมติว่าฟังก์ชันใน TestJigsaw.py ชื่อ predict_and_explain
        toxicity_results = predict_and_explain(text_batch, jigsaw_model, jigsaw_tokenizer, jigsaw_thresholds)
        
        # ดึงข้อมูลจากผลลัพธ์แรก (index 0)
        result_data = toxicity_results[0]
        prediction_dict = result_data['prediction']
        triggered_labels = [label for label, value in prediction_dict.items() if value == 1]
        
        if triggered_labels:
            toxicity_analysis["is_toxic"] = True
            toxicity_analysis["toxic_types"] = triggered_labels
            
            top_explanation = result_data['explanation'][:3] 
            
            # ✨ แก้ไขบรรทัดนี้: ดึงเฉพาะ word (ตัวแรกของ tuple) ออกมา
            just_the_words = [word for word, score in top_explanation]
            
            toxicity_analysis["explanation"] = just_the_words

    # สังเกตว่า toxicity_analysis ตอนนี้มีข้อมูล explanation อยู่ด้วย
    return { 
        "comment": comment, 
        "sentiment_group": sentiment_result,
        "toxicity_analysis": toxicity_analysis
    }

