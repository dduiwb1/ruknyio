# حل خطأ P3009 (فشل migration سابقة على Railway)

إذا ظهر الخطأ:
```
Error: P3009 - migrate found failed migrations in the target database
The `20260204_add_userfile_blurhash` migration started at ... failed
```

شغّل الأمر التالي **مرة واحدة** ضد قاعدة Railway (مع تعبئة `DATABASE_URL` من Railway):

```bash
# استبدل DATABASE_URL بقيمة من Railway (Variables أو Connect)
npx prisma migrate resolve --rolled-back "20260204_add_userfile_blurhash"
```

**كيف تشغّله:**

1. **من جهازك (موصول بقاعدة Railway):**  
   ثبّت متغيرات البيئة ثم نفّذ الأمر:
   ```bash
   cd apps/api
   set DATABASE_URL=postgresql://...   # من Railway
   set DIRECT_URL=postgresql://...     # إن وُجد
   npx prisma migrate resolve --rolled-back "20260204_add_userfile_blurhash"
   ```

2. **من Railway:**  
   من لوحة المشروع → الـ Service → **Settings** أو **Variables** انسخ `DATABASE_URL`، ثم من تبويب **Shell** (إن وُجد) أو من جهازك بعد تصدير نفس القيمة نفّذ الأمر أعلاه.

بعد تنفيذ `resolve --rolled-back` بنجاح، أعد نشر التطبيق (Redeploy)؛ عند التشغيل سيعمل `prisma migrate deploy` وتُطبَّق الـ migrations المتبقية.
