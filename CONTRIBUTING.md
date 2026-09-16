# Contributing

แนวทางการ commit และการทำงานร่วมกันในโปรเจกต์นี้

## Commit Message Format

```
<emoji> <type>: <short description>
```

- description เป็นภาษาอังกฤษ, lowercase, ไม่มี period, กระชับ, เน้นว่า "ทำไม" มากกว่า "ทำอะไร"

### Type Reference

| Emoji | Type | ใช้เมื่อ |
|-------|------|----------|
| ✨ | `feat` | เพิ่ม feature ใหม่ |
| 🐛 | `fix` | แก้ bug |
| 🎨 | `ui` | แก้ UI / style / layout |
| ♻️ | `refactor` | refactor โดยไม่เปลี่ยน behavior |
| 📝 | `docs` | แก้ documentation / README |
| 🔧 | `chore` | config, tooling, dependencies |
| 🔥 | `remove` | ลบโค้ดหรือไฟล์ที่ไม่ใช้ |
| ✅ | `test` | เพิ่ม/แก้ test |
| ⚡ | `perf` | ปรับ performance |
| 🔒 | `security` | แก้ปัญหาด้านความปลอดภัย |

## Rules

1. 1 commit = 1 เรื่อง — ไม่รวมหลาย feature ใน commit เดียว
2. ไม่ commit ไฟล์ที่ไม่เกี่ยว เช่น `.env`, `node_modules`, ไฟล์ log
3. feature branch ก่อน merge — ไม่ push ตรง `main`/`master` (ยกเว้น commit แรกของโปรเจกต์ตาม `IMPLEMENTATION_PLAN.md` Phase 0)

## Branch Naming

```
feature/<short-name>     เช่น  feature/api-integration
fix/<issue-or-desc>      เช่น  fix/case-status-transition
chore/<task>             เช่น  chore/update-deps
```

## ก่อน commit ทุกครั้ง

- ตรวจสอบว่าไม่มี `.env` หรือ Google API key หลุดไปกับ commit (`git status`, grep หา key pattern)
- รัน `npm test` ในส่วนที่แก้ไข (backend/frontend) ให้ผ่านก่อน commit
