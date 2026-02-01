# OAuth (Google / LinkedIn) على localhost

## المشكلة: بعد تسجيل الدخول يُوجّه إلى المشروع الحقيقي بدلاً من localhost

### السبب

الـ API بعد نجاح OAuth يعيد التوجيه إلى عنوان الواجهة من المتغير `FRONTEND_URL`. إذا كان مضبوطاً على رابط الإنتاج (مثل `https://rukny.xyz`) سيتم التوجيه إلى الإنتاج حتى عند التطوير على localhost.

### الحل

في بيئة التطوير، ضع في `apps/api/.env`:

```env
# في التطوير: التوجيه بعد Google/LinkedIn إلى الواجهة المحلية
FRONTEND_URL_DEV=http://localhost:3000
```

- إذا كان `NODE_ENV=development` و`FRONTEND_URL_DEV` موجوداً، سيُستخدم للتوجيه بعد OAuth بدلاً من `FRONTEND_URL`.
- يمكنك الإبقاء على `FRONTEND_URL=https://rukny.xyz` للإنتاج واستخدام `FRONTEND_URL_DEV` للتطوير فقط.

---

## LinkedIn على localhost

لكي يعمل تسجيل الدخول عبر LinkedIn على localhost:

1. **في `apps/api/.env`:**
   ```env
   FRONTEND_URL_DEV=http://localhost:3000
   LINKEDIN_CALLBACK_URL=http://localhost:3001/api/v1/auth/linkedin/callback
   ```
   (غيّر المنفذ `3001` إذا كان الـ API يعمل على منفذ آخر.)

2. **في لوحة تطبيق LinkedIn (Developer Portal):**
   - في إعدادات التطبيق، قسم **Authorized redirect URLs** أضف:
     `http://localhost:3001/api/v1/auth/linkedin/callback`
   - احفظ التغييرات.

بدون ذلك، LinkedIn سيرجع المستخدم إلى الرابط المسجّل لديهم (غالباً الإنتاج) ولن يعمل التوجيه إلى localhost.

---

## Google على localhost

نفس الفكرة:

1. **في `apps/api/.env`:**
   ```env
   FRONTEND_URL_DEV=http://localhost:3000
   GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
   ```

2. **في Google Cloud Console:**
   - في **Authorized redirect URIs** أضف:
     `http://localhost:3001/api/v1/auth/google/callback`
