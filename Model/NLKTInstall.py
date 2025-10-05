import nltk
import ssl

# ส่วนนี้ช่วยแก้ปัญหา SSL certificate errors ที่อาจเกิดขึ้นตอนดาวน์โหลด
# ซึ่งเป็นสาเหตุที่ทำให้การดาวน์โหลดครั้งก่อนอาจไม่สมบูรณ์
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

print("--- Starting Final NLTK Data Download ---")

# รายการแพ็กเกจข้อมูลที่จำเป็นทั้งหมด รวมถึงตัวที่ขาดไป
required_packages = [
    'punkt',      # สำหรับ word_tokenize และ sent_tokenize
    'punkt_tab',  # ✨ ตัวที่ขาดไปและทำให้เกิด Error ล่าสุด
    'wordnet',    # สำหรับ WordNetLemmatizer
    'omw-1.4',    # Dependency สำหรับ wordnet
    'stopwords'   # สำหรับลบคำที่ไม่สำคัญ
]

# วนลูปดาวน์โหลดทีละแพ็กเกจ
for package in required_packages:
    try:
        print(f"Checking for '{package}'...")
        # วิธีตรวจสอบที่แน่นอนกว่าสำหรับแต่ละประเภท
        if 'punkt' in package:
             nltk.data.find(f'tokenizers/{package}')
        elif package == 'stopwords':
             nltk.data.find(f'corpora/{package}')
        else:
             nltk.data.find(f'corpora/{package}.zip')
        print(f"✅ '{package}' is already available.")
    except LookupError:
        print(f"Downloading '{package}'...")
        nltk.download(package) # แสดง log การดาวน์โหลด
        print(f"✅ Download complete for '{package}'.")

print("\n--- All NLTK data packages should now be complete. ---")
# ```

# ### ขั้นตอนการดำเนินการ

# 1.  **อัปเดตไฟล์:** แก้ไขไฟล์ `download_nltk.py` ด้วยโค้ดด้านบน
# 2.  **หยุดเซิร์ฟเวอร์:** กด `Ctrl + C` ใน Terminal ที่รัน FastAPI อยู่
# 3.  **รันสคริปต์ดาวน์โหลด:** เปิด Terminal ใหม่ (หรือใช้ Terminal เดิม) แล้วรันคำสั่ง:
#     ```bash
#     python download_nltk.py
#     ```
#     สังเกตดูว่ามันดาวน์โหลด `punkt_tab` สำเร็จหรือไม่
# 4.  **เริ่มเซิร์ฟเวอร์ใหม่:** หลังจากดาวน์โหลดเสร็จ ให้รันเซิร์ฟเวอร์ FastAPI ของคุณอีกครั้ง:
#     ```bash
#     fastapi dev api.py
    

