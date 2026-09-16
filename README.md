# Company Route Finder

เว็บแอปแสดงเส้นทาง ระยะทาง และเวลาเดินทาง (traffic-aware) จากตำแหน่งปัจจุบันของผู้ใช้ไปยังตำแหน่งบริษัท บน Google Maps

รายละเอียดแผนงานและสถาปัตยกรรมทั้งหมดอยู่ใน [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

## Tech Stack

- Backend: Node.js + Express
- Frontend: Nuxt 4 (Vue 3)
- Map: Google Maps JavaScript API (frontend) + Directions API (backend)

## Structure

```
backend/    # Express API, เรียก Google Directions API
frontend/   # Nuxt 4 app, แสดงแผนที่และเส้นทาง
```

## Setup

ต้องมี Google Cloud API keys 2 ตัวแยกกัน (ดูรายละเอียดใน [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) หัวข้อ 3):
- **Browser key** — เปิดใช้ Maps JavaScript API, restrict ด้วย HTTP referrer
- **Server key** — เปิดใช้ Directions API + Geocoding API, restrict ด้วย IP address

### Backend

```bash
cd backend
npm install
cp .env.example .env
# แก้ .env ใส่ GOOGLE_MAPS_SERVER_KEY, COMPANY_LAT, COMPANY_LNG (พิกัดบริษัท)
npm start
```

รันที่ `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# แก้ .env ใส่ NUXT_PUBLIC_GOOGLE_MAPS_KEY (browser key)
npm run dev
```

รันที่ `http://localhost:3000`

## Test

```bash
cd backend && npm test    # Jest + Supertest (mock Google API, ไม่ยิง Google จริง)
cd frontend && npm test   # Vitest + @vue/test-utils
```

**สำคัญ**: ห้ามใส่ `.env` จริงเข้า git เด็ดขาด — ไฟล์นี้ถูก ignore ไว้แล้ว (`.gitignore`), commit เฉพาะ `.env.example` เท่านั้น
