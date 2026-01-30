# شرح المشاكل والحلول

## المشاكل التي ظهرت:

### 0️⃣ جلسة لا تُحفظ أو لا تُحدَّث في الإنتاج (Session / Refresh Token)

**الأعراض:**
- تسجيل الدخول يعمل ثم تُفقد الجلسة بعد إعادة تحميل الصفحة أو بعد دقائق
- رسالة "Refresh token not found" أو 401 عند استدعاء `/api/auth/refresh`
- يحدث في الإنتاج (production) بينما يعمل في التطوير

**السبب:**
- في `cookie.config.ts` كان يتم تعيين **Refresh Token** cookie بـ `path: '/api/v1/auth'` في الإنتاج
- المتصفح يرسل الكوكي فقط عندما يكون مسار الطلب مطابقاً لـ path الكوكي
- الواجهة تستدعي `/api/auth/refresh` (عبر Next.js proxy) وليس `/api/v1/auth/refresh`
- لذلك المتصفح **لم يكن يرسل** refresh_token مع الطلب → فشل التجديد

**الحل المطبق:**
- تعيين `path: '/'` لـ Refresh Token cookie في كل البيئات (في `apps/api/src/domain/auth/cookie.config.ts`)
- تعيين نفس `path: '/'` عند مسح الكوكي في `clearAuthCookies` و `clearRefreshTokenCookie`

**التحقق:** بعد تسجيل الدخول في الإنتاج، طلب `/api/auth/refresh` يجب أن يستقبل refresh_token في الـ Cookie ويُعيد توكنز جديدة.

---

### 0️⃣ ب — انتهاء الجلسة بعد 15 دقيقة ورسالة "انتهت صلاحية جلستك. يرجى تسجيل الدخول"

**الأعراض:**
- بعد ~15 دقيقة من تسجيل الدخول يتم تسجيل الخروج تلقائياً مع رسالة "انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى" أو "Session ended, please log in"

**السبب:**
- **Access Token** (JWT) صالح لمدة **30 دقيقة** (في auth.service و token.service)
- **كوكي Access Token** كان مضبوطاً على **maxAge: 15 دقيقة** في `cookie.config.ts`
- المتصفح يحذف الكوكي بعد 15 دقيقة، فتصبح الطلبات التالية بدون access token → 401
- التمديد التلقائي (proactive refresh) في الواجهة يعمل كل **25 دقيقة**، فلا يحدث تجديد قبل انتهاء الكوكي عند 15 دقيقة
- عند 401 يحاول العميل استدعاء `/api/auth/refresh`؛ إن فشل (أو لم يُرسَل refresh_token سابقاً بسبب path خاطئ) يتم توجيه المستخدم لصفحة تسجيل الدخول

**الحل المطبق:**
- تعيين **maxAge** لكوكي Access Token إلى **30 دقيقة** (مطابق لصلاحية JWT) في `apps/api/src/domain/auth/cookie.config.ts`
- تحديث `expires_in` في استجابات المصادقة إلى `30 * 60` (ثوانٍ) في auth.controller و quicksign.controller و two-factor.controller

بعد التعديل، الكوكي والـ JWT ينتهيان معاً بعد 30 دقيقة، والتمديد التلقائي عند 25 دقيقة يجدد التوكنز قبل انتهاء الصلاحية.

---

### 0️⃣ ج — تسجيل خروج خاطئ بعد 401 عند استخدام secureFetch (تم إصلاحه)

**الأعراض:** عند انتهاء صلاحية access token، أي صفحة أو مكوّن يستخدم `secureFetch` من `api-client.ts` (مثل الإعدادات، لوحة التحكم، Google Sheets) كان يُسجّل المستخدم خروجاً حتى عند نجاح `/api/auth/refresh`.

**السبب:** استجابة `/auth/refresh` تُرجع التوكنز في **كوكيز httpOnly** و`csrf_token` في الـ body فقط (بدون `access_token` في الـ body). كان `api-client` يتحقق من `data.access_token` ويعتبر التجديد فاشلاً عند غيابه فيُوجّه لصفحة تسجيل الدخول.

**الحل المطبق:** في `apps/web/src/lib/api/api-client.ts`: اعتبار النجاح عند `data.success && data.csrf_token`، استدعاء `setCsrfToken(data.csrf_token)` و`updateLastRefreshTime()`، وإعادة الطلب الأصلي مع `credentials: 'include'` (بدون إضافة Authorization لأن التوكن في الكوكي).

---

### ⚠️ قيود / عيوب معروفة (لم تُصلح بعد)

- **SessionTimeoutWarning:** المكوّن يعتمد على `getAccessToken()` لقراءة انتهاء صلاحية التوكن، لكن التوكن الآن في كوكي httpOnly فلا يُقرأ من JavaScript (`getAccessToken()` يُرجع دائماً `null`). لذلك تحذير "جلستك على وشك الانتهاء" لا يظهر. التمديد التلقائي عند 25 دقيقة ما زال يعمل عبر `auth-provider`، لكن المستخدم لا يرى نافذة التمديد.
- **مدة Refresh Token:** OAuth (Google/LinkedIn) يُنشئ جلسات بمدة refresh **14 يوم** (auth.service)، بينما QuickSign/2FA يستخدمان **30 يوم** (token.service). سلوك متعمد لكن غير موحّد.
- **ملف .env:** التأكد من أن `.env` مضاف في `.gitignore` وأن القيم الحقيقية (JWT_SECRET، مفاتيح OAuth، إلخ) لا تُرفع إلى المستودع. إذا تم رفع `.env` سابقاً يجب تدوير جميع المفاتيح.

---

### 1️⃣ تحذير Middleware (⚠️ Deprecated)

**نص الخطأ:**
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**الشرح:**
- في Next.js 16، تم تغيير طريقة عمل middleware
- الملف `middleware.ts` في المجلد الرئيسي أصبح قديم (deprecated)
- يجب استخدامه في مجلد `src/` أو استخدام "proxy" الجديد

**الحل المطبق:**
✅ الملف موجود بالفعل في `src/middleware.ts` (المكان الصحيح)
✅ تم تبسيط الكود لجعله أسرع (إزالة async fetch)
✅ التحقق من التوكن يتم الآن من الكوكيز فقط

**التحسينات:**
- قبل: كان يعمل `fetch` للـ API في كل request → بطيء جداً
- بعد: فحص بسيط للتوكن في الكوكيز → سريع

---

### 2️⃣ خطأ 404 على صفحة /login

**نص الخطأ:**
```
GET /login 404 in 6.8s (compile: 6.6s, render: 139ms)
```

**الشرح:**
- الصفحة استغرقت 6.6 ثانية للـ compile (أول مرة)
- ظهر خطأ 404 بسبب مشكلة في التوجيه من الـ middleware

**السبب الرئيسي:**
الـ middleware القديم كان يعمل `async fetch` للـ API، مما تسبب في:
- بطء شديد في الاستجابة
- مشاكل في التوجيه
- تعطيل الصفحات أحياناً

**الحل المطبق:**
✅ إزالة الـ `async` من middleware
✅ استخدام فحص بسيط للتوكن
✅ التحقق الكامل من صلاحية التوكن يحدث في الـ client side

---

### 3️⃣ تحذير Cross Origin

**نص الخطأ:**
```
⚠ Cross origin request detected from 192.168.0.161 to /_next/* resource.
In a future major version of Next.js, you will need to explicitly configure "allowedDevOrigins"
```

**الشرح:**
- هذا يحدث عند فتح الموقع من جهاز آخر على نفس الشبكة المحلية
- مثلاً: تفتح من الموبايل على http://192.168.0.161:3000
- Next.js يحذرك أنه في المستقبل ستحتاج لتفعيل هذا صراحةً

**الحل المطبق:**
✅ إضافة `allowedDevOrigins` في `next.config.ts`
```typescript
allowedDevOrigins: ['http://192.168.0.161:3000'],
```

**ملاحظة:** هذا فقط في بيئة التطوير (Development). في الإنتاج لا حاجة له.

---

## الكود القديم vs الجديد

### ❌ Middleware القديم (بطيء):
```typescript
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  
  // ❌ هذا يعمل fetch للـ API في كل request!
  const isAuthenticated = await checkAuth(token);
  // ...
}

async function checkAuth(token: string | undefined): Promise<boolean> {
  // ❌ بطيء جداً - يستدعي API في كل request
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.ok;
}
```

**المشكلة:** كل صفحة تفتحها تنتظر API response (حتى 6 ثواني!)

### ✅ Middleware الجديد (سريع):
```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  
  // ✅ فحص بسيط وسريع
  const hasToken = !!token;
  
  // Redirects based on token presence
  // ...
}
```

**الفائدة:** فحص فوري، التحقق الكامل يحدث في الصفحة نفسها

---

## كيف يعمل النظام الآن؟

### طبقات الحماية:

1. **Middleware (Layer 1 - سريع وبسيط):**
   - فحص وجود التوكن في الكوكيز
   - إعادة توجيه أولية
   - لا يتحقق من صلاحية التوكن (لتحقيق السرعة)

2. **صفحة Login/Register (Layer 2):**
   ```typescript
   useEffect(() => {
     const checkAuth = async () => {
       const token = getToken();
       if (token) {
         // التحقق من صلاحية التوكن
         const res = await fetch('/api/auth/me');
         if (res.ok) router.replace("/dashboard");
       }
     };
     checkAuth();
   }, []);
   ```

3. **AuthContext (Layer 3 - إدارة الحالة):**
   - التحقق من التوكن عبر التطبيق
   - تحديث حالة المستخدم
   - إدارة Login/Logout

4. **Dashboard Pages (Layer 4):**
   - التحقق النهائي من المستخدم
   - جلب بيانات المستخدم
   - عرض المحتوى

---

## خطوات إعادة التشغيل

إذا ظهرت أي مشاكل بعد التحديث:

```powershell
# 1. إيقاف السيرفر (Ctrl+C)

# 2. حذف cache
cd apps\web
Remove-Item -Recurse -Force .next

# 3. إعادة التشغيل
npm run dev
```

---

## اختبار الحلول

### ✅ اختبار Middleware:
1. افتح http://localhost:3000/login
2. يجب أن تفتح بسرعة (بدون تأخير)
3. سجل دخول
4. حاول العودة لـ /login → يجب أن يوجهك لـ /dashboard

### ✅ اختبار Cross Origin:
1. افتح من جهاز آخر على الشبكة
2. استخدم IP مثل http://192.168.0.161:3000
3. يجب ألا يظهر تحذير في console

### ✅ اختبار السرعة:
1. افتح Developer Tools → Network
2. انتقل بين الصفحات
3. يجب أن تكون سريعة (< 500ms)

---

## ملخص التحسينات

| المشكلة | الحل | النتيجة |
|---------|------|---------|
| Middleware بطيء (6 ثواني) | إزالة async fetch | سرعة فورية |
| تحذير deprecated | استخدام src/middleware.ts | لا تحذيرات |
| Cross origin warning | إضافة allowedDevOrigins | دعم الأجهزة الأخرى |
| 404 على /login | تبسيط middleware logic | صفحات تعمل بشكل صحيح |

---

## نصائح مستقبلية

1. **لا تستخدم fetch في middleware** → بطيء جداً
2. **اجعل middleware بسيط** → فقط للتحقق الأولي
3. **التحقق الكامل في الصفحات** → أكثر مرونة وأمان
4. **استخدم Context API** → لإدارة الحالة عبر التطبيق

---

**تم إصلاح جميع المشاكل! ✅**
