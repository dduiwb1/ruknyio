# مميزة التحقق من البريد الإلكتروني في النماذج

## 📋 نظرة عامة

تم بنجاح تفعيل مميزة **التحقق من البريد الإلكتروني** بشكل كامل في نماذج Rukny. هذه المميزة تسمح للمستخدمين بالتحقق من صحة بريدهم الإلكتروني قبل تقديم النموذج باستخدام رمز تحقق يُرسَل إلى بريدهم.

---

## 🚀 الميزات المُنفذة

### **Backend (NestJS API)**

#### 1️⃣ **قاعدة البيانات**
- ✅ إضافة جدول `form_email_verifications` لتخزين رموز التحقق
- ✅ إضافة حقل `emailVerification` إلى جدول `form_fields`

#### 2️⃣ **Prisma Schema**
- ✅ تحديث `FormField` موديل ليتضمن `emailVerification: Boolean`
- ✅ إنشاء موديل جديد `form_email_verifications` مع الحقول:
  - `id`: معرّف فريد
  - `formId`: معرّف النموذج
  - `fieldId`: معرّف حقل البريد
  - `email`: البريد الإلكتروني المراد التحقق منه
  - `code`: رمز التحقق (6 أرقام)
  - `verified`: حالة التحقق
  - `expiresAt`: توقيت انتهاء صلاحية الرمز (15 دقيقة)
  - `attempts`: عدد محاولات إدخال الرمز
  - `ipAddress` و `userAgent`: بيانات أمان

#### 3️⃣ **FormEmailVerificationService**
خدمة جديدة في `/apps/api/src/domain/forms/services/form-email-verification.service.ts`:

**الدوال الأساسية:**
```typescript
// إرسال رمز التحقق
sendVerificationCode(
  formId: string,
  fieldId: string,
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string; expiresIn: number }>

// التحقق من رمز المستخدم
verifyCode(
  formId: string,
  email: string,
  code: string,
  ipAddress?: string
): Promise<{ success: boolean; message: string }>

// التحقق من أن البريد مُحقّق مسبقاً
isEmailVerified(
  formId: string,
  email: string
): Promise<boolean>

// تنظيف رموز منتهية الصلاحية (Cron Job)
cleanupExpiredVerifications(): Promise<number>
```

**المزايا الأمنية:**
- رموز 6 أرقام عشوائية
- انتهاء صلاحية بعد 15 دقيقة
- حد أقصى 3 محاولات لإدخال الرمز
- تتبع IP Address و User Agent
- نظام تسجيل شامل

#### 4️⃣ **API Endpoints**

**Endpoint 1: إرسال رمز التحقق (Public)**
```
POST /forms/public/:slug/send-verification-code
Content-Type: application/json

{
  "fieldId": "field-id-1",
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Verification code sent to your email",
  "expiresIn": 900  // بالثواني
}
```

**Endpoint 2: التحقق من الرمز (Public)**
```
POST /forms/public/:slug/verify-email-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Rate Limiting:**
- إرسال الرمز: 5 محاولات / دقيقة (لكل IP)
- التحقق من الرمز: 5 محاولات / دقيقة (لكل IP)

#### 5️⃣ **Email Template**
قالب بريد جميل ومحترف يتضمن:
- شعار Rukny Forma
- اسم النموذج
- رمز التحقق بحجم كبير وواضح
- رسالة انتهاء الصلاحية
- تحذير أمني
- روابط التذييل

---

### **Frontend (Next.js)**

#### 1️⃣ **Hook: `useFormEmailVerification`**
في `/apps/web/src/lib/hooks/useFormEmailVerification.ts`:

```typescript
const {
  isLoading,
  verificationState,
  sendVerificationCode,
  verifyCode,
  resetVerification,
} = useFormEmailVerification({ formSlug });

// إرسال رمز التحقق
await sendVerificationCode({
  fieldId: 'field-id-1',
  email: 'user@example.com',
});

// التحقق من الرمز
await verifyCode({
  email: 'user@example.com',
  code: '123456',
});
```

#### 2️⃣ **Component: `EmailFieldWithVerification`**
في `/apps/web/src/components/(app)/forms/EmailFieldWithVerification.tsx`:

مكون متطور يوفر:
- ✅ حقل إدخال البريد الإلكتروني
- ✅ زر "إرسال رمز التحقق"
- ✅ حقل إدخال الرمز (6 أرقام فقط)
- ✅ عداد الوقت المتبقي
- ✅ إعادة محاولة الرمز
- ✅ رسائل خطأ واضحة
- ✅ حالة نجاح بصرية
- ✅ رسائل Toast للتنبيهات

**Features:**
- واجهة سلسة بـ Framer Motion
- تصميم مستجيب (Desktop و Mobile)
- معالجة الأخطاء الشاملة
- دعم اللغة العربية الكامل
- ألوان تناسب Theme النموذج

#### 3️⃣ **Integration في `FormFullPreview`**
تم تحديث مكون العرض الكامل للنموذج ليدعم الحقول المطلوبة التحقق:

```tsx
{field.type === FieldType.EMAIL && field.emailVerification && formSlug ? (
  <EmailFieldWithVerification
    fieldId={field.id}
    label=""
    description={field.description}
    placeholder={field.placeholder}
    required={field.required}
    emailVerification={true}
    formSlug={formSlug}
    value={value}
    onChange={(val) => handleValueChange(field.id, val)}
  />
) : (
  // input عادي بدون تحقق
)}
```

#### 4️⃣ **CreateFormWizard Updates**
تم تحديث معالج إنشاء النموذج ليتضمن:
- ✅ خيار تشغيل/إيقاف التحقق من البريد في نافذة تعديل الحقل
- ✅ رمز Shield بجانب خيار التحقق
- ✅ وصف التحقق الحالي

---

## 🔄 سير العمل (Workflow)

### **من جانب المستخدم:**
1. ينشئ/يحرر نموذج
2. يختار حقل "البريد الإلكتروني"
3. يُفعّل "التحقق من البريد" في نافذة التعديل
4. ينشر النموذج

### **من جانب الملء (Form Submission):**
1. المستخدم يفتح النموذج
2. يُدخل بريده الإلكتروني
3. يضغط "إرسال رمز التحقق"
4. يتلقى رسالة بريد بالرمز
5. يُدخل الرمز في الحقل
6. يُضغط "تأكيد"
7. عند النجاح: يتم فتح النموذج للملء
8. عند الفشل: رسالة خطأ واضحة

---

## 🛡️ الأمان

### **Measures Implemented:**
- ✅ رموز عشوائية قوية (6 أرقام)
- ✅ انتهاء صلاحية (15 دقيقة)
- ✅ حد محاولات (3 محاولات max)
- ✅ Rate limiting على API
- ✅ التحقق من صيغة البريد
- ✅ تتبع IP و User Agent
- ✅ تسجيل شامل (Logging)
- ✅ تنظيف أوتوماتيكي للرموز المنتهية الصلاحية

---

## 📊 قاعدة البيانات

### **جدول `form_email_verifications`**
```sql
CREATE TABLE form_email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid(),
  formId UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  fieldId UUID NOT NULL,
  email VARCHAR NOT NULL,
  code VARCHAR NOT NULL UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  verifiedAt TIMESTAMP NULL,
  expiresAt TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  maxAttempts INT DEFAULT 3,
  ipAddress VARCHAR NULL,
  userAgent VARCHAR NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  -- Indices for performance
  INDEX (formId),
  INDEX (email),
  INDEX (code),
  INDEX (expiresAt),
  INDEX (verified)
);
```

---

## 🧪 الاختبار

### **API Testing:**
```bash
# 1. إرسال رمز التحقق
curl -X POST http://localhost:3001/forms/public/my-form/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{
    "fieldId": "field-123",
    "email": "test@example.com"
  }'

# 2. التحقق من الرمز
curl -X POST http://localhost:3001/forms/public/my-form/verify-email-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

### **Frontend Testing:**
- اختبر التحقق من البريد مع نموذج واقعي
- تحقق من رسائل الخطأ
- تحقق من حالات التايمأوت
- تحقق من الاستجابة على الهاتف المحمول

---

## 📝 الملفات المضافة/المعدلة

### **Backend:**
- `apps/api/prisma/schema.prisma` - تحديث Schema
- `apps/api/src/domain/forms/services/form-email-verification.service.ts` - خدمة جديدة
- `apps/api/src/domain/forms/dto/email-verification.dto.ts` - DTOs جديدة
- `apps/api/src/domain/forms/forms.module.ts` - إضافة الخدمة للـ Module
- `apps/api/src/domain/forms/forms.controller.ts` - إضافة Endpoints جديدة

### **Frontend:**
- `apps/web/src/lib/hooks/useFormEmailVerification.ts` - Hook جديد
- `apps/web/src/components/(app)/forms/EmailFieldWithVerification.tsx` - مكون جديد
- `apps/web/src/components/(app)/forms/FormFullPreview.tsx` - تحديث للدعم الجديد

---

## 🚀 الخطوات التالية (Future Improvements)

- [ ] دعم SMS بدلاً من البريد الإلكتروني
- [ ] دعم التحقق متعدد المراحل
- [ ] لوحة تحكم لرؤية رموز التحقق المرسلة
- [ ] Export إحصائيات التحقق من البريد
- [ ] تكامل مع الخدمات الخارجية (SendGrid, Mailgun, etc.)
- [ ] إعادة محاولة أوتوماتيكية للرموز المنتهية الصلاحية

---

## ✨ الخلاصة

تم بنجاح تطبيق مميزة **التحقق من البريد الإلكتروني** بشكل كامل واحترافي وآمن. المميزة:
- ✅ **آمنة**: رموز قوية والحد من المحاولات
- ✅ **سهلة الاستخدام**: واجهة بديهية وواضحة
- ✅ **موثوقة**: معالجة أخطاء شاملة
- ✅ **قابلة للتوسع**: بنية نظيفة وسهلة الصيانة
- ✅ **مدعومة اللغة العربية**: كل الرسائل باللغة العربية

المميزة جاهزة للاستخدام الفوري! 🎉
