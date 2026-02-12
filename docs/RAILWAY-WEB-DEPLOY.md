# رفع تطبيق Web (الفرونت) على Railway

## 1) إنشاء خدمة جديدة للمشروع

- **Railway** → مشروعك → **New** → **GitHub Repo** (أو استخدم نفس الـ Repo إذا يدعم Railway خدمات متعددة من نفس المستودع).
- أو: **Add Service** → **Empty Service** ثم ربطه بالمستودع وضبط الإعدادات أدناه.

## 2) إعدادات البناء (Build)

| الإعداد | القيمة |
|--------|--------|
| **Root Directory** | `apps/web` |
| **Dockerfile Path** | `Dockerfile` (أو `apps/web/Dockerfile` إذا كان Root = جذر المستودع) |
| **Build Command** | يُستخدم الـ Dockerfile، لا حاجة لـ Build Command |

إذا اخترت **Root Directory** = `apps/web`:
- **Dockerfile Path** = `Dockerfile` (داخل apps/web).

## 3) متغيرات البيئة (Variables)

في الخدمة الجديدة (Web) اضبط:

| المتغير | القيمة | ملاحظة |
|--------|--------|--------|
| **API_BACKEND_URL** | `https://auth.rukny.io` | عنوان الـ API (نفس الخدمة التي تعمل على Railway) |
| **NEXT_PUBLIC_APP_URL** | `https://rukny.io` أو عنوان الـ Web بعد النشر | عنوان الفرونت النهائي |
| **NEXT_PUBLIC_API_EXTERNAL_URL** | `https://auth.rukny.io/api/v1` | للاستدعاءات الخارجية (OAuth، روابط مباشرة) |

**PORT** يُضبط تلقائياً من Railway، لا حاجة لتعريفه.

## 4) النطاق (Domain)

- من إعدادات الخدمة → **Settings** → **Networking** → **Generate Domain** أو أضف نطاقاً مخصصاً (مثل `rukny.io` أو `www.rukny.io`).
- إذا استخدمت نطاقاً مخصصاً، اضبط **DNS** (CNAME) كما يظهر في Railway.

## 5) ملاحظات

- الفرونت يوجّه طلبات `/api/v1/*` و `/uploads/*` إلى **API_BACKEND_URL** (عبر Next.js rewrites)، لذلك يجب أن يكون الـ API يعمل ومتاحاً على هذا الرابط.
- بعد أول نشر، جرّب فتح نطاق الـ Web والتأكد من تسجيل الدخول ووصول الواجهة للـ API.
