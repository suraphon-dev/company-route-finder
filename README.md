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

จะเพิ่มคำแนะนำ setup/run/test ที่นี่เมื่อ backend และ frontend ถูกสร้างขึ้น (ดู Phase 1-2 ใน `IMPLEMENTATION_PLAN.md`)
