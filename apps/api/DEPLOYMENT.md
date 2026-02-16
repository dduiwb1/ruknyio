# 🚀 دليل النشر - Rukny API

تم تجهيز المشروع للنشر على عدة منصات استضافة. اختر المنصة المناسبة لك:

---

## 📋 الأوامر المطلوبة حسب المنصة

### 🚂 **Railway**
استخدم الملف `railway.toml` الموجود، أو أضف في لوحة التحكم:

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm run deploy
```

**أو:**
```bash
sh start.sh
```

---

### 🎨 **Render**
استخدم الملف `render.yaml` الموجود، أو أضف في لوحة التحكم:

**Build Command:**
```bash
npm install; npx prisma generate; npm run build
```

**Start Command:**
```bash
npm run deploy
```

---

### 🐳 **Docker (أي منصة)**

**بناء الصورة:**
```bash
docker build -t rukny-api .
```

**تشغيل الحاوية:**
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  rukny-api
```

---

## 🔧 Scripts المتاحة في package.json

| Script | الوصف |
|--------|-------|
| `npm run build` | بناء المشروع |
| `npm run start:prod` | تشغيل المشروع بدون migrations |
| `npm run deploy` | **تشغيل migrations + بدء التطبيق** ⭐ |
| `npm run migrate` | تشغيل migrations فقط |
| `npm run start:dev` | تشغيل وضع التطوير |

---

## ⚙️ متغيرات البيئة المطلوبة

تأكد من إضافة هذه المتغيرات في منصة الاستضافة:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# App
NODE_ENV=production
PORT=3000

# AWS S3 (إذا كنت تستخدم S3)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
S3_BUCKET_NAME=...

# Google OAuth (إذا كنت تستخدم Google Login)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=...

# Email (إذا كنت تستخدم Resend)
RESEND_API_KEY=...

# Redis (للـ caching)
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...
```

---

## 🐛 حل المشكلة الحالية

الخطأ **"The column does not exist"** يحدث لأن migrations لم تطبق على قاعدة البيانات.

### ✅ الحل:

1. **تأكد من استخدام أمر Start الصحيح:**
   ```bash
   npm run deploy
   ```
   (وليس npm run start:prod فقط)

2. **أو استخدم:**
   ```bash
   sh start.sh
   ```

3. **أو يدوياً:**
   ```bash
   npx prisma migrate deploy && npm run start:prod
   ```

---

## 📝 ملاحظات مهمة

1. ⚠️ **لا تستخدم** `npm run start:prod` مباشرة بدون تشغيل migrations أولاً
2. ✅ **استخدم دائماً** `npm run deploy` أو `sh start.sh`
3. 🔒 تأكد من أن DATABASE_URL موجود في المتغيرات البيئية
4. 📦 سيتم تشغيل `prisma generate` تلقائياً بعد `npm install` بفضل postinstall hook

---

## 🆘 المساعدة

إذا واجهت مشاكل:

1. تحقق من logs المنصة
2. تأكد من DATABASE_URL صحيح
3. جرب تشغيل `npx prisma migrate deploy` يدوياً
4. تأكد من أن قاعدة البيانات تقبل اتصالات من الخارج

---

**آخر تحديث:** فبراير 2026
