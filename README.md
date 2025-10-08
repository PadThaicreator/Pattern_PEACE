# Pattern_PEACE

1) 6520502073 สุทธิพัชร์ พราหมณ์น้อย 
2) 6520503274 ชวนันท์ มุสิการุณ 
3) 6520503312 ดรัณ จันทร์ขุนทศ 
4) 6520503410 ปุณณวิช ภู่สกุล

## Web Application - คู่มือการติดตั้ง

### Frontend

1. เปิด Command Prompt (cmd) ในโฟลเดอร์ Frontend
2. รันคำสั่ง:
   ```bash
   npm install
   ```
3. รัน Web Application:
   ```bash
   npm run dev
   ```
4. เว็บจะรันที่: `http://localhost:5173/`

#### ข้อมูลการ Login
- **Email:** `poonnawit.po@gmail.com`
- **Password:** `1234567`

---

### Backend

#### Backend_NodeJS

1. เปิด Command Prompt (cmd) ในโฟลเดอร์ `Backend_NodeJS`
2. รันคำสั่ง:
   ```bash
   npm install
   ```
3. สร้าง Prisma Client:
   ```bash
   npx prisma generate
   ```

#### Model

1. เปิด Command Prompt (cmd) ในโฟลเดอร์ `Model`
2. รันคำสั่ง:
   ```bash
   pip install "fastapi[standard]"
   pip install -r requirement.txt
   ```

---

### การรัน Backend

1. เมื่อติดตั้งเสร็จทั้งหมดแล้ว ให้เข้าไปที่โฟลเดอร์ `Backend_NodeJS`
2. รันคำสั่ง:
   ```bash
   npm run dev
   ```
3. รอจนกว่าข้อความต่อไปนี้จะแสดงขึ้น (แสดงว่าพร้อมใช้งาน):
   ```
   [1] Weights loaded into new model 
   [1] Checking NLTK dependencies... 
   [1] NLTK dependencies are already satisfied. 
   [1] INFO: Started server process [24680] 
   [1] INFO: Waiting for application startup. 
   [1] INFO: Application startup complete.
   ```

---

## สรุปคำสั่งทั้งหมด

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Backend
```bash
# Backend_NodeJS
cd Backend_NodeJS
npm install
npx prisma generate
npm run dev

# Model (รันในหน้าต่าง cmd แยกต่างหาก)
cd Model
pip install "fastapi[standard]"
pip install -r requirements.txt
```

---

## หมายเหตุ

- ต้องรัน Backend ก่อน Frontend
- ตรวจสอบให้แน่ใจว่ามี Node.js และ Python ติดตั้งในเครื่องแล้ว
- Backend_NodeJS จะรวม FastAPI ไว้ด้วย ดังนั้นต้องติดตั้งทั้ง Node.js และ Python dependencies


.env
   JWT_SECRET=SECRETKEY
   PORT=5000
   DATABASE_URL="mongodb+srv://kopkit2542_db_user:86FP86G57ngsay4V@cluster0.qxqb091.mongodb.net/PEACE?retryWrites=true&w=majority&appName=Cluster0"
   BEARER_TOKEN =AAAAAAAAAAAAAAAAAAAAAOxM4QEAAAAA8uEi52qBRw9E788x42dhpS9TDVQ%3DHgQEE2kFejbvoeN8HTekIvjg0C84c3GeyDV5HPqOHd273MVI7s
