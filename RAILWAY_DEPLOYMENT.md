# 🚀 Railway Deployment Guide - API Only

## طريقة رفع المشروع على الموقع (ملخص)

1. **ربط GitHub:** في [railway.app](https://railway.app) → New Project → Deploy from GitHub repo → اختر المستودع.
2. **Root Directory:** في إعدادات الخدمة اترك **Root Directory** فارغاً (جذر المستودع).
3. **البناء:** Railway يكتشف `railway.json` ويبني باستخدام **Dockerfile** من `apps/api/Dockerfile` تلقائياً.
4. **المتغيرات:** أضف في Variables على الأقل: `DATABASE_URL`, `PORT=4000`, `NODE_ENV=production`, `JWT_SECRET`, `CORS_ORIGINS`. إن استخدمت Neon أضف `DIRECT_URL`.
5. **الدومين:** من تبويب Networking اضغط Generate Domain أو أضف دومين مخصص (مثل `api.rukny.io`).
6. **Migrations:** بعد أول نشر ناجح شغّل من جهازك: `railway link` ثم `railway run npm run migrate` (من مجلد `apps/api`).
7. **النشر التلقائي:** أي `git push origin main` يطلق بناء ونشر جديد تلقائياً.

---

## 📋 الخطوات الأساسية (تفصيل)

### الخطوة 1: تسجيل الدخول إلى Railway
```bash
railway login
```

### الخطوة 2: إنشاء مشروع جديد (من لوحة التحكم)
1. اذهب إلى https://railway.app
2. الضغط على **New Project**
3. اختيار **Deploy from GitHub repo**
4. ربط مستودع `Rukny.io`

### الخطوة 3: قاعدة البيانات (PostgreSQL أو Neon)

**خيار أ – PostgreSQL في Railway:**
من لوحة تحكم Railway:
1. اضغط **+ New** بجانب المشروع
2. اختر **Database** → **PostgreSQL**
3. انتظر حتى ينتهي التثبيت (~1 دقيقة)
4. اذهب إلى PostgreSQL → **Variables**
5. **انسخ** `DATABASE_URL` بالكامل

**خيار ب – Neon (Prisma 7):**
1. أنشئ مشروعاً في [Neon](https://neon.tech) وانسخ رابط الاتصال.
2. في Neon ستجد عادةً:
   - **Connection string (pooled)** → استخدمها كـ `DATABASE_URL`
   - **Connection string (direct)** → استخدمها كـ `DIRECT_URL` (مطلوب للـ migrations مع Prisma 7)
3. أضف في Railway Variables:
   - `DATABASE_URL` = الرابط المجمع من Neon
   - `DIRECT_URL` = الرابط المباشر من Neon

### الخطوة 4: متغيرات البيئة

في Railway Dashboard:
1. اختر المشروع
2. اضغط على **Variables**
3. أضف المتغيرات التالية:

```env
# Basic
NODE_ENV=production
PORT=4000

# Database (Railway Postgres أو Neon)
DATABASE_URL=${{Postgres.DATABASE_URL}}
# عند استخدام Neon مع Prisma 7 أضف أيضاً:
# DIRECT_URL=رابط_الاتصال_المباشر_من_Neon

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-chars-long-change-this
JWT_EXPIRATION=7d

# CORS
CORS_ORIGINS=http://localhost:3000,http://192.168.1.x:3000,http://yourfrontend.com

# Mail (if needed)
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USER=your-email@gmail.com
# MAIL_PASSWORD=your-password

# AWS S3 (if using file uploads)
# AWS_ACCESS_KEY_ID=your-key
# AWS_SECRET_ACCESS_KEY=your-secret
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=your-bucket
```

### الخطوة 5: إعداد الخدمة

1. في Railway Dashboard
2. اضغط **+ New** → **GitHub Repo**
3. اختر نفس المستودع
4. في **Settings** اكتب التالي:

#### General
```
Name: api
Root Directory: (اتركه فارغاً أو ".")  ← مهم: سياق البناء يجب أن يكون جذر المستودع
```

#### Build (استخدام Docker)
- البناء يتم عبر **Dockerfile**.
- **لا تضبط Root Directory على `apps/api`** — اتركه فارغاً حتى يكون سياق البناء جذر المستودع (حيث يوجد `package-lock.json`).
- مسار الـ Dockerfile: في **Variables** أضف `RAILWAY_DOCKERFILE_PATH=apps/api/Dockerfile` أو استخدم الإعداد من لوحة التحكم إن وُجد.

#### Networking (Domain)
- اضغط **Generate Domain** أو أضف custom domain مثل `api.rukny.io`
- ستحصل على رابط مثل: `xxxxx.up.railway.app`

### الخطوة 6: تشغيل Migrations

من Terminal المحلي:

```bash
# تسجيل الدخول
railway login

# الذهاب للمجلد
cd apps/api

# ربط المشروع
railway link  # اختر المشروع من القائمة

# تشغيل Migrations
railway run pnpm prisma migrate deploy

# أو إذا كنت تستخدم npm:
railway run npm run migrate
```

### الخطوة 7: التحقق من أن التطبيق يعمل

```bash
# اختبر من Browser أو Terminal
curl https://your-project.up.railway.app/api/health

# يجب أن يرجع:
# {"status":"ok"}
```

---

## 🐳 ما يفعله الـ Dockerfile

```dockerfile
1. Build Stage:
   ✅ Ubuntu Alpine + Node 20 (صغير الحجم)
   ✅ تثبيت npm dependencies
   ✅ توليد Prisma client
   ✅ Compile TypeScript → JavaScript

2. Runtime Stage:
   ✅ صورة جديدة نظيفة (بدون build tools)
   ✅ نسخ الملفات المترجمة فقط
   ✅ Health check كل 30 ثانية
```

---

## 🚀 الـ Deploy التلقائي

لا تحتاج تفعل شيء! Railway يراقب الـ GitHub branch `main` تلقائياً:

```
git push origin main 
  ↓
GitHub Webhook يُخبر Railway
  ↓
Railway يبني الـ Docker image
  ↓
Railway يشغل Container الجديد
  ↓
Docker Health Check يتحقق من الـ API
```

---

## ✅ قائمة التحقق

- [ ] حساب Railway جاهز ومرتبط مع GitHub
- [ ] مشروع Railway تم إنشاؤه
- [ ] PostgreSQL تم إضافة
- [ ] متغيرات البيئة مُضافة
- [ ] Dockerfile موجود في `apps/api/`
- [ ] `railway.json` في جذر المستودع (يحدد `dockerfilePath: apps/api/Dockerfile`)
- [ ] **Root Directory** في Railway = فارغ (جذر المستودع)
- [ ] Migrations تمت بنجاح: `railway run npm run migrate`
- [ ] Health endpoint يرد: `curl https://your-url.up.railway.app/api/health`
- [ ] Frontend متصل ب API بشكل صحيح

---

## 🔧 استكشاف المشاكل

### المشكلة: `"/package-lock.json": not found` أو فشل بناء Docker
**السبب:** تم ضبط Root Directory على `apps/api` فسياق البناء يصبح ذلك المجلد فقط ولا يوجد فيه `package-lock.json`.
**الحل:**
1. في Railway → الخدمة → **Settings** → **General**
2. ضع **Root Directory** فارغاً (أو `.`) لاستخدام جذر المستودع
3. تأكد من وجود الملف `railway.json` في جذر المستودع (يحدد مسار الـ Dockerfile: `apps/api/Dockerfile`)

### المشكلة: Build فشل مع "nest: not found" أو "Could not resolve @prisma/client" أو "query_compiler_fast_bg.postgresql.wasm-base64.js"
**الحل (عند استخدام Railpack):**
1. **Root Directory** يجب أن يكون فارغاً.
2. في **Settings → Build** عيّن **Build command** إلى (مهم جداً):
   ```bash
   npm run build:railway
   ```
   هذا الأمر يثبّت التبعيات مع `NODE_ENV=development` (حتى يتوفر حزمة `@prisma/client` كاملة مع ملفات الـ runtime)، ثم يشغّل `prisma generate` عبر سكربت Node يضبط **NODE_PATH**، ثم يبني الـ API.
3. لا تستخدم `npm install && npm run build:api` كأمر بناء—استخدم **فقط** `npm run build:railway`.
4. بعد أي تعديل على `overrides` في الجذر شغّل مرة واحدة: `npm install` ثم commit لملف `package-lock.json`.

### المشكلة: Database connection failed
**الحل**: تأكد من `DATABASE_URL` في Variables صحيحة

### المشكلة: CORS Error
**الحل**: أضف Frontend URL في متغير `CORS_ORIGINS`

### المشكلة: POST request returns 404
**الحل**: تأكد من أن routes مسجلة بشكل صحيح في الـ Controllers

---

## 📞 روابط مفيدة

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/cli/commands)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)
- [NestJS Deployment](https://docs.nestjs.com/deployment/overview)

---

*تم التحديث: 10 فبراير 2026*
