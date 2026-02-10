# 🚀 دليل البدء السريع - تقسيم المشروع

## الرؤية المختصرة

```
┌─────────────────────────────────┐
│  rukny.io (Web - Next.js)       │
└──────┬──────────────┬───────────┘
       │              │
       ▼              ▼
   auth.rukny.io  dev.rukny.io
   (Port 3001)    (Port 3000)
```

---

## ⚡ التثبيت السريع (5 دقائق)

### 1. إعداد متغيرات البيئة

```bash
# انسخ الملف
cp .env.example .env

# عدّل القيم الحساسة في .env
# جرب مع القيم الافتراضية للتطوير أولاً
```

### 2. تشغيل الخدمات

```bash
# تشغيل جميع الخدمات معاً
docker-compose -f docker-compose.services.yml up -d

# تحقق من الحالة
docker-compose -f docker-compose.services.yml ps
```

### 3. تشغيل الـ Migrations

```bash
# Auth Service
docker-compose -f docker-compose.services.yml exec auth \
  npx prisma migrate dev --name init

# API Service (نفس قاعدة البيانات)
docker-compose -f docker-compose.services.yml exec api \
  npx prisma migrate deploy
```

### 4. اختبر الخدمات

```bash
# Auth - تسجيل دخول
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@rukny.io","password":"Test123!@"}'

# API - استدعاء محمي
curl http://localhost:3002/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# Web
open http://localhost:3000
```

---

## 📂 البنية الجديدة

```
Rukny.io/
├── apps/
│   ├── auth/                    # ✨ خدمة جديدة
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── email/
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   └── package.json
│   │
│   ├── api/                     # معدل: بدون auth كامل
│   │   ├── src/
│   │   ├── prisma/
│   │   └── package.json
│   │
│   └── web/                     # مستقل: بدون تغيير
│
├── docker/
│   ├── Dockerfile.auth
│   ├── Dockerfile.api
│   └── .dockerignore
│
├── docker-compose.services.yml  # ✨ جديد
├── .env.example                # معدل
│
└── docs/
    ├── MICROSERVICES_ARCHITECTURE.md  # ✨
    ├── SERVICE_COMMUNICATION.md       # ✨
    └── DEPLOYMENT_MICROSERVICES.md    # ✨
```

---

## 🔄 خطوات التقسيم المرحلية

### المرحلة 1: تحضير الهيكل (اليوم)

- [x] إنشاء مجلد `apps/auth`
- [ ] نسخ ملفات التكوين من API
- [ ] تثبيت الاعتماديات

### المرحلة 2: فصل الكود (غداً)

- [ ] نقل auth module من API إلى Auth
- [ ] نقل users module
- [ ] نقل email module
- [ ] حذف modules من API

### المرحلة 3: التكامل (بعد غد)

- [ ] اختبار التواصل بينهما
- [ ] تحديث الـ Environment Variables
- [ ] اختبار الـ Tokens

### المرحلة 4: النشر (الأسبوع المقبل)

- [ ] بناء Docker images
- [ ] نشر على Railway/Vercel
- [ ] تعيين النطاقات

---

## 🐳 الأوامر الشائعة

### تشغيل الخدمات

```bash
# الكل معاً
docker-compose -f docker-compose.services.yml up

# خدمة واحدة فقط
docker-compose -f docker-compose.services.yml up auth

# في الخلفية
docker-compose -f docker-compose.services.yml up -d
```

### مراقبة السجلات

```bash
# جميع السجلات
docker-compose -f docker-compose.services.yml logs -f

# خدمة واحدة
docker-compose -f docker-compose.services.yml logs -f auth

# آخر 100 سطر
docker-compose -f docker-compose.services.yml logs --tail=100 api
```

### تنفيذ أوامر

```bash
# في Auth Service
docker-compose -f docker-compose.services.yml exec auth npm run migrate

# في API Service
docker-compose -f docker-compose.services.yml exec api npm run seed

# في Database
docker-compose -f docker-compose.services.yml exec postgres psql -U rukny_admin -d rukny_io
```

### إيقاف والتنظيف

```bash
# إيقاف الخدمات
docker-compose -f docker-compose.services.yml down

# مع حذف البيانات
docker-compose -f docker-compose.services.yml down -v

# إعادة بناء الصور
docker-compose -f docker-compose.services.yml build --no-cache
```

---

## 🧪 اختبار سريع

### 1. تسجيل مستخدم جديد

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!@",
    "name": "New User"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "New User"
  }
}
```

### 2. تسجيل الدخول

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!@"
  }'

# احفظ accessToken
TOKEN="eyJ..."
```

### 3. استخدام الـ Token في API

```bash
curl -X GET http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer $TOKEN"
```

### 4. تحديث الـ Token

```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "..."}'
```

---

## 🛠️ استكشاف الأخطاء

### الخدمات لا تبدأ

```bash
# تحقق من صحة Syntax
docker-compose -f docker-compose.services.yml config

# أعد بناء الصور
docker-compose -f docker-compose.services.yml build --no-cache

# احذف الصور القديمة
docker image prune -a
```

### مشكلة الاتصال بقاعدة البيانات

```bash
# تحقق من الاتصال
docker-compose -f docker-compose.services.yml exec postgres \
  psql -U rukny_admin -d rukny_io -c "SELECT 1;"

# أعد تشغيل postgres
docker-compose -f docker-compose.services.yml restart postgres
```

### مشاكل الـ Redis

```bash
# تحقق من الاتصال
docker-compose -f docker-compose.services.yml exec redis \
  redis-cli ping

# حذف البيانات (حذر!)
docker-compose -f docker-compose.services.yml exec redis \
  redis-cli FLUSHALL
```

---

## 📋 الملفات المرجعية

| الملف | الوصف |
|------|-------|
| [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md) | الرؤية العامة والبنية |
| [SERVICE_COMMUNICATION.md](SERVICE_COMMUNICATION.md) | البروتوكول والتواصل |
| [DEPLOYMENT_MICROSERVICES.md](DEPLOYMENT_MICROSERVICES.md) | النشر على Railway |
| [docker-compose.services.yml](../docker-compose.services.yml) | ملف التشغيل |
| [.env.example](../.env.example) | متغيرات البيئة |

---

## ✅ قائمة تحقق سريعة

- [ ] يعمل `docker-compose up` بدون أخطاء
- [ ] قاعدة البيانات تتصل بدون مشاكل
- [ ] Auth Service متوفر على `http://localhost:3001`
- [ ] API Service متوفر على `http://localhost:3000`
- [ ] Web متوفر على `http://localhost:3002`
- [ ] اختبار Register/Login ناجح
- [ ] اختبار API مع Token ناجح

---

## 🤝 المساعدة والدعم

إذا واجهت مشاكل:

1. **حقق من السجلات:**
   ```bash
   docker-compose -f docker-compose.services.yml logs -f SERVICE_NAME
   ```

2. **أعد تشغيل الخدمة:**
   ```bash
   docker-compose -f docker-compose.services.yml restart SERVICE_NAME
   ```

3. **احذف ووأعد البدء:**
   ```bash
   docker-compose -f docker-compose.services.yml down -v
   docker-compose -f docker-compose.services.yml up -d
   ```

---

## 📞 الخطوات التالية

1. ✅ تشغيل الهيكل الأساسي
2. ⏳ فصل auth module من API
3. ⏳ اختبار التواصل بين الخدمات  
4. ⏳ نشر على البيئة الإنتاجية

