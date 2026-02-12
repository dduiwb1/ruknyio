# تشغيل API على Railway – قائمة التحقق

## عند ظهور "Application failed to respond"

### 1) فحص سجلات النشر (Deploy Logs)
- Railway → مشروعك → **API Service** → **Deployments** → آخر نشر → **View Logs**
- ابحث عن أسطر حمراء أو رسالة `Error` / `throw` قبل توقف التطبيق

### 2) متغيرات البيئة المطلوبة (Variables)
في **Railway** → API Service → **Variables** تأكد من وجود:

| المتغير | مطلوب؟ | ملاحظة |
|--------|--------|--------|
| `DATABASE_URL` | نعم | عادة يضاف تلقائياً عند ربط PostgreSQL |
| `DIRECT_URL` | يُفضّل | نفس قيمة DATABASE_URL إن لم تستخدم connection pooler |
| `JWT_SECRET` | نعم | **32 حرفاً على الأقل**، وتجنب القيمة الافتراضية |
| `TWO_FACTOR_ENCRYPTION_KEY` | نعم | **32 حرفاً على الأقل** |
| `FRONTEND_URL` | نعم في الإنتاج | مثال: `https://rukny.io` أو `https://auth.rukny.io` |
| `REDIS_HOST` / `REDIS_PORT` | إن كنت تستخدم Redis | أضف خدمة Redis في Railway وربطها أو استخدم Redis خارجي |

### 3) أسباب شائعة للتوقف
- **JWT_SECRET قصير أو غير مضبوط** → التطبيق يرمي خطأ عند البدء.
- **عدم وجود REDIS** بينما الكود يتصل بـ Redis → فشل الاتصال وتوقف.
- **DATABASE_URL خاطئ أو غير مضبوط** → فشل اتصال Prisma وتوقف.

### 4) بعد تعديل Variables
احفظ المتغيرات ثم من **Deployments** اختر **Redeploy** لآخر نشر حتى يعيد التشغيل بالإعدادات الجديدة.

---

## 502 Bad Gateway عند استدعاء rukny.io/api/auth/*

الطلبات تمر: **المتصفح → Vercel (rukny.io) → Backend (Railway)**. الـ 502 يعني أن Vercel لا يصل إلى الـ Backend.

**الحل:** في مشروع **Vercel** (الفرونت)، اضبط متغير البيئة:

| المتغير | القيمة |
|--------|--------|
| **API_BACKEND_URL** | عنوان الـ API العام على Railway، **بدون** `/api/v1` في النهاية. مثال: `https://auth.rukny.io` أو `https://xxx.up.railway.app` |

- من أين تأخذ الرابط: Railway → API Service → **Settings** → **Networking / Domains** → انسخ الـ URL.
- بعد الحفظ: **Redeploy** لمشروع الفرونت على Vercel.
