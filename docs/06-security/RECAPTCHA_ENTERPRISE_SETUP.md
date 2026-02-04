# 🔒 دليل إعداد reCAPTCHA Enterprise

## نظرة عامة

تم تكامل reCAPTCHA Enterprise في النظام لتوفير حماية متقدمة ضد البوتات والأنشطة المشبوهة. يعمل النظام مع Google reCAPTCHA Enterprise API لتقييم الطلبات وتحديد مستوى الخطر.

## الميزات

- ✅ **حماية النماذج**: تحقق تلقائي من reCAPTCHA قبل إرسال النماذج
- ✅ **تقييم النقاط**: نظام نقاط متقدم لتحديد مستوى الخطر  
- ✅ **إعداد مرن**: يمكن تشغيله أو إيقافه حسب البيئة
- ✅ **تسجيل مفصل**: مراقبة وتسجيل جميع عمليات التحقق
- ✅ **عتبات قابلة للتخصيص**: عتبات مختلفة حسب نوع العمل

## الإعداد المطلوب

### 1. إعداد Google Cloud Project

1. انتقل إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو استخدم مشروع موجود
3. فعّل **reCAPTCHA Enterprise API**
4. أنشئ **API Key** جديد

### 2. إعداد reCAPTCHA Enterprise

1. انتقل إلى [reCAPTCHA Enterprise Console](https://console.cloud.google.com/security/recaptcha)
2. أنشئ موقع جديد:
   - **نوع الموقع**: Score-based
   - **النطاقات**: أضف نطاقات موقعك
   - **تطبيقات Android/iOS**: اختياري

### 3. متغيرات البيئة

أضف المتغيرات التالية لملف `.env`:

```env
# reCAPTCHA Enterprise Configuration
RECAPTCHA_PROJECT_ID=your-google-cloud-project-id
RECAPTCHA_SITE_KEY=6LcYWWAsAAAAAJpv0z4pIQqOIhl05dUUzauUEG2D  
RECAPTCHA_API_KEY=your-google-cloud-api-key
```

## كيفية العمل

### Frontend (Client-Side)

```typescript
import { useRecaptchaEnterprise } from '@/lib/hooks/useRecaptchaEnterprise';

// في مكون النموذج
const { executeRecaptcha } = useRecaptchaEnterprise();

const handleSubmit = async () => {
  // تنفيذ reCAPTCHA قبل الإرسال
  const token = await executeRecaptcha('FORM_SUBMIT');
  
  // إرسال النموذج مع الرمز المميز
  await submitForm({ ...formData, recaptchaToken: token });
};
```

### Backend (Server-Side)

```typescript
// في خدمة النماذج
async submitForm(formId: string, data: any) {
  // التحقق من reCAPTCHA إذا كان موجوداً
  if (data.recaptchaToken) {
    const verification = await this.recaptchaService.verifyToken(
      data.recaptchaToken,
      'FORM_SUBMIT'
    );
    
    if (!verification.success) {
      throw new BadRequestException('reCAPTCHA verification failed');
    }
  }
  
  // متابعة معالجة النموذج...
}
```

## عتبات النقاط

| نوع العمل | العتبة | الوصف |
|-----------|--------|-------|
| FORM_SUBMIT | 0.5 | إرسال النماذج العامة |
| LOGIN | 0.7 | تسجيل الدخول |
| REGISTER | 0.6 | التسجيل الجديد |
| CONTACT | 0.3 | نماذج الاتصال |
| CHECKOUT | 0.8 | عمليات الشراء |
| COMMENT | 0.4 | التعليقات |

## استكشاف الأخطاء

### خطأ: "reCAPTCHA token is required"
- تأكد من إرسال الرمز المميز مع البيانات
- تحقق من تحميل JavaScript API بشكل صحيح

### خطأ: "reCAPTCHA verification failed"  
- تحقق من صحة متغيرات البيئة
- تأكد من صحة النطاقات المضافة في Console
- تحقق من انتهاء صلاحية API Key

### نقاط منخفضة باستمرار
- راجع إعدادات الموقع في Console
- تحقق من التطبيق الصحيح للـ Actions
- راجع السجلات للحصول على تفاصيل أكثر

## الأمان

- ⚠️ **لا تكشف API Key**: احتفظ بـ API Key في متغيرات البيئة
- ✅ **استخدم HTTPS**: تأكد من استخدام HTTPS في الإنتاج  
- ✅ **راجع السجلات**: راقب السجلات بانتظام للكشف عن المشاكل
- ✅ **حدّث العتبات**: اضبط العتبات حسب احتياجات موقعك

## البيئات

### التطوير (Development)
```env
RECAPTCHA_PROJECT_ID=
RECAPTCHA_SITE_KEY=
RECAPTCHA_API_KEY=
# إذا لم تكن مضبوطة، سيتم تخطي التحقق
```

### الإنتاج (Production)
```env  
RECAPTCHA_PROJECT_ID=your-production-project-id
RECAPTCHA_SITE_KEY=your-production-site-key
RECAPTCHA_API_KEY=your-production-api-key
```

## موارد إضافية

- [وثائق reCAPTCHA Enterprise](https://cloud.google.com/recaptcha-enterprise/docs)
- [أفضل الممارسات](https://developers.google.com/recaptcha/docs/v3)
- [إدارة النقاط والعتبات](https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment)