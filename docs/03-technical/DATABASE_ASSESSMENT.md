# تقييم قاعدة البيانات — التصميم، البنية، الأمان، والأداء

## 1. التصميم والبنية ✅ جيد

- **التطبيع:** الجداول منظمة مع علاقات واضحة (`User` → `Profile`, `Session`, `SecurityLog`, إلخ) و`onDelete: Cascade` حيث يناسب.
- **الهوية:** استخدام `@id @default(uuid())` لمعظم الجداول مناسب للتوزيع وتفادي التخمين.
- **الفهارس والتفرد:** وجود `@unique` على الحقول المنطقية (مثل `email`, `username`, `refreshTokenHash`) وعدد كبير من `@@index` على الأعمدة المستخدمة في الاستعلامات والفلترة.
- **التسمية:** أسماء الجداول والحقول متسقة؛ بعض الجداول بـ snake_case (`quicksign_links`, `trusted_devices`) والبعض PascalCase — مقبول مع `@@map` للتوحيد على مستوى DB.

**اقتراح بسيط:** توحيد أسلوب التسمية في الـ schema (مثلاً PascalCase للـ models مع `@@map("snake_case")` للجداول) لاحقاً لتحسين القراءة فقط.

---

## 2. الأمان ✅ جيد

- **بيانات حساسة:**
  - **كلمات المرور:** لا يظهر تخزين كلمة مرور مباشرة في الـ schema (تسجيل دخول بدون كلمة مرور / OAuth/QuickSign).
  - **الجلسات:** تخزين `refreshTokenHash` فقط (SHA-256) وليس التوكن نفسه — صحيح.
  - **2FA:** `twoFactorSecret` مخزن؛ يُفضّل أن يكون مشفّراً على مستوى التطبيق إذا لم يكن DB encryption مفعّلاً.
- **العلاقات:** استخدام `onDelete: Cascade` بحذر (مثلاً مع `Session`, `SecurityLog`) يقلل البيانات المتبقية بعد حذف المستخدم.
- **السجلات:** جدول `SecurityLog` مع `action`, `status`, `ipAddress`, `userAgent` يدعم التدقيق والكشف عن سلوك مشبوه.
- **قفل الحسابات:** `AccountLockout` و`IPLockout` مع `lockedUntil` يحدان من هجمات القوة الغاشمة.

**اقتراح:** إذا كان `twoFactorSecret` و`googleRefreshToken` يحتويان على قيم حساسة جداً، النظر في تشفيرهم على مستوى التطبيق (Encryption at rest) أو استخدام خدمة إدارة أسرار.

---

## 3. الأداء ✅ جيد مع تحسينات مطبّقة

- **الفهارس الحالية:** فهارس على `userId`, `createdAt`, `expiresAt`, `status`, وغيرها في جداول الحركة (Sessions, SecurityLog, Forms, Orders…) مناسبة لمعظم الاستعلامات والتنظيف.
- **تنظيف البيانات (Cleanup):**
  - خدمة تنظيف مجدولة (Cron) مع **distributed lock (Redis)** لتفادي تشغيل التنظيف من أكثر من instance — جيد.
  - حذف على دفعات (batch) في `cleanupOldSecurityLogs` لتقليل طول الـ transactions.
  - فترات الاحتفاظ محددة في `DB_CLEANUP.RETENTION` (مثلاً 90 يوم للسجلات الأمنية، 30 لمحاولات الدخول).

**تحسينات تم تطبيقها في الـ schema:**
- **Session:** إضافة `@@index([expiresAt])` و`@@index([revokedAt])` لتسريع `cleanupExpiredSessions` (حذف الجلسات المنتهية أو الملغاة القديمة).
- **quicksign_links:** إضافة `@@index([usedAt])` لتسريع حذف الروابط المستخدمة القديمة في عملية التنظيف.

بعد تطبيق الـ migration، يُفترض أن تنخفض أو تختفي تحذيرات "Slow Query" الخاصة بعمليات الـ DELETE في التنظيف (أو أن تصبح أوضح إذا كان السبب حجم البيانات وليس غياب الفهارس).

---

## 4. إعدادات التشغيل والأداء

- **اتصال DB:** استخدام `DB_POOL`, `QUERY_TIMEOUTS`, `STATEMENT_TIMEOUT` في `database.constants.ts` مناسب للتحكم في الضغط والـ timeouts.
- **تنبيه الاستعلامات البطيئة:** `DB_PERFORMANCE.SLOW_QUERY_THRESHOLD` يسمح بمراقبة الاستعلامات البطيئة وتفادي تدهور الأداء.

---

## 5. خلاصة

| الجانب      | التقييم | ملاحظات مختصرة |
|------------|---------|-----------------|
| التصميم    | جيد     | علاقات واضحة، تطبيع جيد، هوية UUID |
| البنية     | جيد     | فهارس وتفرد كافية، تسمية متسقة مع الـ map |
| الأمان     | جيد     | عدم تخزين التوكنات بشكل صريح، سجلات أمنية، قفل حسابات |
| الأداء     | جيد     | فهارس مناسبة + تحسين فهارس التنظيف (Session, quicksign_links) |

**الخطوة التالية:** تشغيل migration لإنشاء الفهارس الجديدة على `sessions.expiresAt`, `sessions.revokedAt`, و`quicksign_links.usedAt`:

```bash
cd apps/api && npx prisma migrate dev --name add_cleanup_indexes
```

(في الإنتاج استخدم `prisma migrate deploy` بعد المراجعة.)
