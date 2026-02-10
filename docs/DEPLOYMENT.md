# 🚀 دليل النشر - Rukny (البيئة التجريبية والرئيسية)

## الدومينات والبيئات

| البيئة     | الدومين (Frontend) | API (اختياري)   | الفرع في Git |
|-----------|--------------------|------------------|---------------|
| **تجريبية** | `https://rukny.xyz`  | `https://api.rukny.xyz` | `develop`     |
| **رئيسية**  | `https://rukny.io`   | `https://api.rukny.io`  | `main`        |

---

## 1️⃣ الطريقة الموصى بها: Vercel مع فرعين (Git Integration)

بهذه الطريقة **كل دفع (push) ينشر تلقائياً** دون الحاجة لخطوات إضافية.

### الخطوة 1: مشروع واحد في Vercel مع فرعين

1. ادخل إلى [Vercel Dashboard](https://vercel.com/dashboard) وافتح مشروع الـ Frontend (أو أنشئ مشروعاً من المستودع).
2. **Settings** → **Git**:
   - **Production Branch**: اختر `main` ← النشر من هذا الفرع سيُربط بدومين الإنتاج.
   - تأكد أن الريبو متصل (GitHub/GitLab/Bitbucket).

### الخطوة 2: ربط الدومينات

1. **Settings** → **Domains**.
2. أضف الدومينات:
   - `rukny.io` و `www.rukny.io` → عيّنها **Production** (أي تُستخدم عند النشر من فرع `main`).
   - `rukny.xyz` و `www.rukny.xyz` → عيّنها **Preview** أو أنشئ لها **Branch/Preview Domain** وربطها بفرع `develop`.

**إذا كان Vercel يسمح بـ "Branch-specific domains":**

- فرع `main` → `rukny.io` (و `www.rukny.io`).
- فرع `develop` → `rukny.xyz` (و `www.rukny.xyz`).

**إذا لم يتوفر Branch Domain:** استخدم **مشروعين منفصلين** (الطريقة 2 أدناه).

### الخطوة 3: متغيرات البيئة حسب البيئة

في **Settings** → **Environment Variables** عيّن القيم لكل بيئة:

**للدومين الرئيسي (Production – rukny.io):**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://rukny.io
NEXT_PUBLIC_API_EXTERNAL_URL=https://api.rukny.io/api/v1
API_BACKEND_URL=https://api.rukny.io
```

**للدومين التجريبي (Preview/Staging – rukny.xyz):**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://rukny.xyz
NEXT_PUBLIC_API_EXTERNAL_URL=https://api.rukny.xyz/api/v1
API_BACKEND_URL=https://api.rukny.xyz
```

اختر لكل متغير: **Production** و/أو **Preview** حسب الجدول أعلاه.

---

## 2️⃣ الطريقة البديلة: مشروعان في Vercel

- **مشروع "Rukny Production"**: مربوط بفرع `main`، دومينه `rukny.io` (و `www.rukny.io`).
- **مشروع "Rukny Staging"**: مربوط بفرع `develop`، دومينه `rukny.xyz` (و `www.rukny.xyz`).

كل مشروع له **Environment Variables** الخاصة به (كما في الجدول أعلاه).

**كيف تنشر:**

- النشر على **البيئة التجريبية**: ادفع إلى فرع `develop` أو اعمل merge لـ `develop`.
- النشر على **البيئة الرئيسية**: ادفع إلى فرع `main` أو اعمل merge لـ `main`.

---

## 3️⃣ الـ API (Backend – Render أو غيره)

الـ API الحالي يدعم كلا الدومين في CORS (`rukny.io` و `rukny.xyz`)، لذا يمكنك:

### خيار أ: API واحد لجميع البيئات

- دومين واحد للـ API، مثلاً `api.rukny.io`.
- في الـ Frontend:
  - **Staging**: `NEXT_PUBLIC_API_EXTERNAL_URL=https://api.rukny.io/api/v1`
  - **Production**: نفس القيمة أو نفس الـ API.

في الـ Backend (Render):

```env
FRONTEND_URL=https://rukny.io
# أضف في CORS أو FRONTEND_URL قائمة تضم أيضاً https://rukny.xyz إن لزم
```

(الكود الحالي يسمح بـ `rukny.xyz` و `rukny.io` في CORS.)

### خيار ب: API منفصل للتجريبي

- **Production**: `api.rukny.io` → خدمة Render للإنتاج.
- **Staging**: `api.rukny.xyz` → خدمة Render ثانية (أو نفس المشروع مع branch/بيئة مختلفة).

في كل خدمة عيّن:

- للإنتاج: `FRONTEND_URL=https://rukny.io` و `COOKIE_DOMAIN=.rukny.io`
- للتجريبي: `FRONTEND_URL=https://rukny.xyz` و `COOKIE_DOMAIN=.rukny.xyz`

---

## 4️⃣ ملخص سريع: كيف تنشر؟

| تريد النشر على | الإجراء |
|----------------|---------|
| **البيئة التجريبية (rukny.xyz)** | ادفع التغييرات إلى فرع `develop` أو اعمل merge إلى `develop`. |
| **البيئة الرئيسية (rukny.io)** | ادفع التغييرات إلى فرع `main` أو اعمل merge إلى `main` (بعد المراجعة). |

إذا كان Vercel مربوطاً بالريبو، النشر يتم تلقائياً بعد كل push ناجح.

---

## 5️⃣ ربط الدومينات في مزود الدومين (DNS)

### للـ Frontend (Vercel)

بعد إضافة الدومين في Vercel، ستظهر لك سجلات مطلوبة (عادة A أو CNAME):

- لـ **rukny.io** و **www.rukny.io**: انسخ القيم من Vercel وأضفها في لوحة DNS لدومين `rukny.io`.
- لـ **rukny.xyz** و **www.rukny.xyz**: نفس الشيء في لوحة DNS لدومين `rukny.xyz`.

### للـ API (مثلاً Render)

- للإنتاج: سجل CNAME مثل `api` → `...onrender.com` لدومين `rukny.io`.
- للتجريبي: سجل CNAME مثل `api` → `...onrender.com` لدومين `rukny.xyz` (إذا استخدمت API منفصل).

---

## 6️⃣ التحقق بعد النشر

- **تجريبي**: افتح `https://rukny.xyz` وتأكد من تسجيل الدخول والـ API.
- **رئيسي**: افتح `https://rukny.io` ونفّذ نفس الاختبارات.

إذا واجهت مشاكل في الكوكيز أو CORS، راجع `COOKIE_DOMAIN` و `FRONTEND_URL` في الـ Backend لكل بيئة.

---

تم التحديث: فبراير 2026
