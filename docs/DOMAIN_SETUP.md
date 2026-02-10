# 🌐 Domain Setup Guide - Rukny.io

## الدومينات المستخدمة

| البيئة     | Frontend      | Backend API       |
|-----------|---------------|-------------------|
| تجريبية  | `https://rukny.xyz`  | `https://api.rukny.xyz`  |
| رئيسية    | `https://rukny.io`   | `https://api.rukny.io`   |

**لتفاصيل النشر (كيف تنشر على التجريبي والرئيسي):** راجع [دليل النشر (DEPLOYMENT.md)](./DEPLOYMENT.md).

---

## 📋 خطوات ربط الدومين في Render

### 1️⃣ في لوحة تحكم Render:

1. اذهب إلى **rukny-api service**
2. انقر على **Settings** → **Custom Domains**
3. انقر على **Add Custom Domain**
4. أدخل: `api.rukny.xyz`
5. سيعطيك Render عنوان CNAME مثل:
   ```
   rukny-api.onrender.com
   ```

### 2️⃣ في لوحة تحكم الدومين (Domain Provider):

أضف سجل CNAME جديد:

```
Type: CNAME
Name: api
Value: rukny-api.onrender.com
TTL: Auto أو 3600
```

### 3️⃣ انتظر انتشار DNS (5-30 دقيقة)

يمكنك التحقق من انتشار DNS:
```bash
nslookup api.rukny.xyz
```

### 4️⃣ تفعيل SSL في Render:

Render سيقوم تلقائياً بتفعيل Let's Encrypt SSL certificate بعد التحقق من الدومين.

---

## 🔧 متغيرات البيئة المطلوبة

### في Render (Backend)

**للبيئة التجريبية (rukny.xyz):**
```bash
FRONTEND_URL=https://rukny.xyz
COOKIE_DOMAIN=.rukny.xyz
COOKIE_SECURE=true
```

**للبيئة الرئيسية (rukny.io):**
```bash
FRONTEND_URL=https://rukny.io
COOKIE_DOMAIN=.rukny.io
COOKIE_SECURE=true
```

### في Vercel (Frontend)

**تجريبي (rukny.xyz):**
```bash
NEXT_PUBLIC_API_EXTERNAL_URL=https://api.rukny.xyz/api/v1
API_BACKEND_URL=https://api.rukny.xyz
NEXT_PUBLIC_APP_URL=https://rukny.xyz
```

**رئيسي (rukny.io):**
```bash
NEXT_PUBLIC_API_EXTERNAL_URL=https://api.rukny.io/api/v1
API_BACKEND_URL=https://api.rukny.io
NEXT_PUBLIC_APP_URL=https://rukny.io
```

---

## ✅ التحقق من الاتصال

بعد الإعداد، تحقق من:

1. Backend Health:
   ```
   https://api.rukny.xyz/api/health
   ```

2. Frontend:
   ```
   https://rukny.xyz
   ```

3. API Connection من Frontend Console:
   ```javascript
   fetch('/api/v1/health').then(r => r.json()).then(console.log)
   ```

---

## 🔄 تدفق الطلبات:

```
المستخدم (Browser)
    ↓
https://rukny.xyz (Frontend - Vercel)
    ↓ (Next.js rewrites)
https://api.rukny.xyz (Backend - Render)
    ↓
Database + Redis
```

---

## 📝 ملاحظات:

- **CORS**: تأكد من أن `FRONTEND_URL` في Backend يطابق دومين Frontend
- **Cookies**: `COOKIE_DOMAIN=.rukny.xyz` يسمح بمشاركة الكوكيز بين النطاقين الفرعيين
- **SSL**: يجب أن يكون `COOKIE_SECURE=true` في الإنتاج
- **DNS TTL**: التغييرات قد تستغرق حتى 48 ساعة للانتشار عالمياً

---

تم التحديث: 28 يناير 2026
