# 🌐 نشر تطبيق الويب (Web) على Vercel

## ملخص سريع

1. اربط المستودع من [Vercel](https://vercel.com) وضَع **Root Directory** = **apps/web** حتى تُخدم الملفات الثابتة (مثل شعارات `/logos/`) بشكل صحيح.
2. استخدم أوامر البناء الافتراضية لـ Next.js (أو كما هو موضّح أدناه).
3. أضف متغيرات البيئة ثم انشر.

---

## الخطوات

### 1. إنشاء مشروع في Vercel

1. ادخل إلى [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. اختر المستودع **rukny.io** (أو انسخ الرابط من GitHub).
3. في **Configure Project**:
   - **Root Directory**: اضغط **Edit** واختر **apps/web** (مهم حتى تعمل الصور في `public/logos/`).
   - **Framework Preset**: Next.js.
   - **Build Command**: اتركه افتراضي أو `npm run build`.
   - **Output Directory**: اتركه افتراضي (`.next`).
   - **Install Command**: `npm install`

إذا كانت الصور/الشعارات لا تظهر (أيقونات مكسورة)، تأكد أن **Root Directory** = **apps/web** في **Settings → General**.

---

### 2. متغيرات البيئة (Environment Variables)

من **Settings → Environment Variables** أضف على الأقل:

| الاسم | الوصف | مثال (رئيسي) |
|--------|--------|----------------|
| `NEXT_PUBLIC_APP_URL` | عنوان الموقع للمتصفح | `https://rukny.io` |
| `NEXT_PUBLIC_API_EXTERNAL_URL` | عنوان الـ API للطلبات من المتصفح | `https://api.rukny.io/api/v1` |
| `API_BACKEND_URL` | عنوان الـ API للطلبات من السيرفر (إن وُجدت) | `https://api.rukny.io` |

**للبيئة التجريبية (مثلاً دومين rukny.xyz):**

- `NEXT_PUBLIC_APP_URL` = `https://rukny.xyz`
- `NEXT_PUBLIC_API_EXTERNAL_URL` = `https://api.rukny.xyz/api/v1`
- `API_BACKEND_URL` = `https://api.rukny.xyz`

تفاصيل إضافية: [DOMAIN_SETUP.md](./DOMAIN_SETUP.md).

---

### 3. النشر

- **نشر تلقائي**: أي `git push` للفرع المتصل (مثلاً `main`) يطلق بناء ونشر جديد.
- **نشر يدوي**: من تبويب **Deployments** → **Deploy** أو من واجهة المشروع.

---

### 4. الدومين المخصص (اختياري)

- من **Settings → Domains** أضف الدومين (مثل `rukny.io` أو `www.rukny.io`).
- في مزود الدومين اضبط **CNAME** أو **A** حسب ما يظهر في Vercel.

---

## ملف `vercel.json` (الجذر)

المشروع يحتوي على `vercel.json` في جذر المستودع:

- **Build Command**: `npm run build:web` (يبني حزمة `apps/web` من الـ monorepo).
- **Output Directory**: `apps/web/.next`.
- **Install Command**: `npm install` (من الجذر لتفعيل الـ workspaces).

لا تحتاج عادةً لتعديل هذا الملف إلا إذا أردت تغيير أوامر البناء أو المسارات.

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| **صور/شعارات مكسورة** (أيقونة صورة رمادية بدل AWS, Google, إلخ) | ضَع **Root Directory** = **apps/web** في **Settings → General**. عندها يُخدم مجلد `public/logos/` من جذر المشروع وتظهر الصور. ثم أعد النشر. |
| Build فشل: `Cannot find module` | مع Root = apps/web، استخدم **Install Command** = `npm install`. إن استمر الخطأ، جرّب من الجذر: Root فارغ، Build = `npm run build:web`، Output = `apps/web/.next`. |
| الصفحة لا تتصل بالـ API | راجع `NEXT_PUBLIC_API_EXTERNAL_URL` و `API_BACKEND_URL` وأن الـ API يعمل على الرابط المستخدم. |
| 404 على الصفحات | مع Root = apps/web، اترك **Output Directory** افتراضي (`.next`). |

---

*تم التحديث: فبراير 2026*
