# Implementation Plan: Company Route Finder (Directions Web App)

## 1. โจทย์สรุป

ระบบเว็บแบ่ง Backend/Frontend ที่:
- แสดงเส้นทางจากตำแหน่งปัจจุบันของผู้ใช้ → ตำแหน่งบริษัท
- แสดงระยะทาง และเวลาที่ใช้เดินทาง (คำนวณจากวันเวลาปัจจุบัน / traffic-aware)
- แสดงผลบน Google Map
- Backend ทำหน้าที่ดึงข้อมูลจาก Google Maps API
- Code ต้องขึ้น Git, **ห้าม Google API Key หลุดเข้า git**

## 2. Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Backend | Node.js + Express |
| Frontend | Nuxt 4 (Vue 3) |
| Map | Google Maps JavaScript API (frontend) + Directions API (backend) |
| Test | Jest/Vitest + Supertest (backend), Vitest + @nuxt/test-utils (frontend) |
| Git hosting | GitHub |
| Deploy | Backend → Render/Railway, Frontend → Vercel |
| Dev tool | Claude Code (CLI) |

## 3. Google Cloud API Key Strategy (สำคัญมาก - อ่านก่อนเริ่ม)

ต้องสร้าง **2 API Keys แยกกัน**:

1. **Browser Key** (ใช้ใน Nuxt frontend, แสดงแผนที่)
   - เปิดใช้: Maps JavaScript API
   - Restriction: **HTTP referrer** จำกัดเฉพาะ domain ของเรา (localhost ตอน dev, โดเมน production ตอน deploy)
   - เก็บใน `frontend/.env` ตัวแปร `NUXT_PUBLIC_GOOGLE_MAPS_KEY`
   - หมายเหตุ: key นี้จะถูก bundle เข้า client-side JS เสมอ (เจตนา ไม่ใช่บั๊ก) ป้องกันด้วย referrer restriction แทน

2. **Server Key** (ใช้ใน Express backend, เรียก Directions API)
   - เปิดใช้: Directions API, Geocoding API
   - Restriction: **IP address** จำกัดเฉพาะ IP ของ server ที่ deploy จริง (ตอน dev ไม่ต้องจำกัด หรือใส่ IP เครื่อง dev)
   - เก็บใน `backend/.env` ตัวแปร `GOOGLE_MAPS_SERVER_KEY`
   - **ห้าม expose ผ่าน endpoint ใดๆ ห้าม log ค่า key ออกมา**

**กฎเหล็ก**: `.gitignore` ต้องมี `.env` ก่อนสร้างไฟล์ `.env` จริง (ทำ gitignore ก่อนเสมอ)

## 4. โครงสร้างโปรเจกต์

```
project-root/
├── backend/
│   ├── src/
│   │   ├── services/googleMaps.js   # เรียก Google Directions API
│   │   ├── routes/directions.js     # POST /api/directions
│   │   ├── app.js                   # express app (export สำหรับ test)
│   │   └── server.js                # listen() จริง
│   ├── tests/
│   │   ├── googleMaps.test.js
│   │   └── directions.route.test.js
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── app/ (หรือ pages/, components/ ตาม Nuxt 4)
│   │   └── components/MapView.vue
│   ├── nuxt.config.ts
│   ├── tests/
│   │   └── MapView.test.ts
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── .gitignore   (root level, กันซ้ำอีกชั้น)
├── README.md
└── IMPLEMENTATION_PLAN.md (ไฟล์นี้)
```

## 5. Environment Variables

**backend/.env.example**
```
GOOGLE_MAPS_SERVER_KEY=
COMPANY_LAT=
COMPANY_LNG=
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

**frontend/.env.example**
```
NUXT_PUBLIC_GOOGLE_MAPS_KEY=
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

---

## 6. Checklist การทำงาน (เรียงตาม Phase)

### Phase 0: Setup พื้นฐาน
- [x] สร้าง repo บน GitHub (private หรือ public ตามที่อาจารย์กำหนด)
- [x] `git init` local + `git remote add origin <url>`
- [x] สร้าง `.gitignore` root ก่อน (`.env`, `.env.*.local`, `node_modules/`, `dist/`, `.output/`)
- [x] สร้าง Google Cloud Project เปิด API: Maps JavaScript API, Directions API, Geocoding API
- [x] สร้าง Browser Key + Server Key ตามข้อ 3 พร้อม restriction ทันที
- [x] ผูก Billing Account
- [x] commit แรก: README + .gitignore + โครง folder เปล่า (commit `9874df8`) — ยังไม่ push

### Phase 1: Backend (Express)
- [x] `npm init` ใน `backend/` + ติดตั้ง `express dotenv axios cors`
- [x] ติดตั้ง dev deps: `jest supertest` (หรือ `vitest supertest`)
- [x] เขียน `services/googleMaps.js` → ฟังก์ชัน `getDirections(origin, destination)` เรียก Directions API พร้อม `departure_time=now`, `traffic_model=best_guess` คืนค่า `{distanceText, durationText, durationInTrafficText, polyline, steps}`
- [x] เขียน `routes/directions.js` → `POST /api/directions` รับ `{lat, lng}`, validate (lat -90..90, lng -180..180), เรียก service, คืน JSON
- [x] เขียน error handling: input ผิด → 400, Google API error/quota → 500 พร้อม message ที่เหมาะสม (ไม่ leak key หรือ raw error)
- [x] ใส่ `cors()` จำกัด origin ตาม `CORS_ORIGIN` env
- [x] แยก `app.js` (export instance) กับ `server.js` (listen) เพื่อให้ test เรียกได้โดยไม่เปิด port จริง

### Phase 1b: Unit Test Backend
- [x] Unit test `services/googleMaps.js`: mock `axios`/ใช้ `nock` (ห้ามยิง Google จริงตอน test) ทดสอบ parse response ถูกต้อง + จัดการ error response ถูกต้อง
- [x] Integration test route ด้วย `supertest` (mock service layer):
  - [x] input ถูกต้อง → 200 + response shape ถูกต้อง
  - [x] ไม่ส่ง lat/lng → 400
  - [x] lat/lng นอกขอบเขต → 400
  - [x] service throw error → 500
- [x] `npm test` ผ่านทั้งหมด (7/7 passed)
- [x] manual sanity check ด้วย Postman/curl ยิง backend จริง (มี key จริง) ยืนยันว่าต่อ Google ได้จริง

### Phase 2: Frontend (Nuxt 4)
- [x] `npx nuxi init frontend`
- [x] ติดตั้ง Google Maps library สำหรับ Vue 3 (เช่น `vue3-google-map`)
- [x] ตั้ง `runtimeConfig.public` ใน `nuxt.config.ts` (`googleMapsKey`, `apiBase`)
- [x] สร้าง `.env` + `.env.example`
- [x] เขียน `MapView.vue`:
  - [x] `onMounted()` → `navigator.geolocation.getCurrentPosition()`
  - [x] handle permission denied → แสดง error message ที่เข้าใจง่าย
  - [x] เรียก backend ผ่าน `useFetch`/`$fetch` ส่ง lat/lng
  - [x] วาดแผนที่ + polyline เส้นทาง ครอบด้วย `<ClientOnly>`
  - [x] แสดง distance / duration / duration in traffic
  - [x] loading state + error state

### Phase 2b: Unit Test Frontend
- [x] ติดตั้ง `vitest @vue/test-utils` (ใช้ plain vitest + `@vitejs/plugin-vue` แทน `@nuxt/test-utils` เพราะเวอร์ชันปัจจุบันของ `@nuxt/test-utils` ไม่ compatible กับ Nuxt 4.5 — เจอ error `NUXT_E1005` ตอนใช้ `nuxt` test environment)
- [x] mock `$fetch` + mock `navigator.geolocation`
- [x] test: geolocation สำเร็จ → trigger fetch ด้วย lat/lng ถูกต้อง
- [x] test: fetch สำเร็จ → แสดง distance/duration ถูกต้อง
- [x] test: fetch ล้มเหลว หรือ geolocation ถูกปฏิเสธ → แสดง error state
- [x] `npm test` ผ่านทั้งหมด (4/4 passed)

### Phase 3: E2E Local Manual Test
- [x] รัน backend + frontend พร้อมกัน local
- [x] ทดสอบ flow เต็ม: เปิดเว็บ → อนุญาต location → เห็นแผนที่ + เส้นทาง + ระยะทาง + เวลา ตรงกับ Google Maps จริง
- [x] ทดสอบ edge case: ปฏิเสธ location, ปิด backend แล้วดู error state
- [x] เช็ค Network tab: frontend ต้องไม่ยิง Directions API ตรง (ต้องผ่าน backend เท่านั้น) — ยืนยันแล้วว่าเห็นแค่ `localhost:3001/api/directions` และ Maps JavaScript API internal calls เท่านั้น

### Phase 4: Security Check ก่อน Push
- [x] `git status` ทั้ง backend/frontend ไม่เห็น `.env`
- [x] `git log --all --full-history -- .env` ยืนยันไม่เคยหลุดในอดีต
- [x] `.env.example` มีแค่ชื่อ key ไม่มีค่าจริง
- [x] grep หา key pattern ในโค้ดทุกไฟล์ (กัน hardcode หลุด) — grep `AIza` ทั้ง backend/frontend branch ไม่พบ
- [x] เขียน README: วิธี setup .env, วิธีรัน, วิธีรัน test

### Phase 5: Push GitHub
- [ ] commit เป็นก้อนมีความหมาย (feat: backend endpoint / feat: nuxt map view / test: ...)
- [ ] push ขึ้น GitHub
- [ ] เปิด repo เช็คด้วยตาว่าไม่มี `.env` ปรากฏจริง (ใช้ GitHub secret scanning ช่วยเช็คด้วย)

### Phase 6: Deploy จริง

**Backend (Render/Railway)**
- [ ] Deploy backend
- [ ] ตั้ง env var (`GOOGLE_MAPS_SERVER_KEY`, `COMPANY_LAT`, `COMPANY_LNG`, `CORS_ORIGIN`) ใน dashboard
- [ ] อัปเดต IP restriction ของ server key เป็น IP จริงของ backend ที่ deploy
- [ ] ทดสอบยิง endpoint ที่ deploy แล้วด้วย Postman

**Frontend (Vercel)**
- [ ] Deploy frontend (connect GitHub repo)
- [ ] ตั้ง env var (`NUXT_PUBLIC_GOOGLE_MAPS_KEY`, `NUXT_PUBLIC_API_BASE` = backend URL จริง)
- [ ] อัปเดต HTTP referrer restriction ของ browser key เป็นโดเมน production จริง
- [ ] อัปเดต `CORS_ORIGIN` ฝั่ง backend ให้ตรงโดเมน frontend production

**Production Test**
- [ ] ทดสอบ flow เต็มบน URL จริง
- [ ] ทดสอบจากมือถือจริง (geolocation behavior ต่างจาก desktop)

### Phase 7: สรุปส่งงาน
- [ ] README ครบ: setup, วิธีรัน local, วิธีรัน test, ลิงก์ production, architecture diagram/คำอธิบาย
- [ ] แนบ URL frontend production
- [ ] แนบ URL repo GitHub
- [ ] เช็ครอบสุดท้าย: `.env` ไม่มีใน git history

---

## 7. หมายเหตุสำหรับ Claude Code Session

เมื่อเปิด session ใหม่ใน Claude Code ให้:
1. แนบไฟล์นี้ (`IMPLEMENTATION_PLAN.md`) เป็น context แรก
2. บอกว่าต้องการเริ่มจาก Phase ไหน (แนะนำเริ่ม Phase 0 → 1 → 2 ตามลำดับ)
3. ให้ Claude Code เช็คทุกครั้งก่อน commit ว่า `.env` ไม่ติดไปด้วย (ย้ำเรื่องนี้ซ้ำได้ เพราะเป็นข้อบังคับของโจทย์)
4. รัน `npm test` ให้ผ่านก่อนขึ้น phase ถัดไปเสมอ
