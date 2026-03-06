# 🔔 Web Push Notifications - Setup Guide

> **⚠️ الحالة:** معطلة مؤقتاً (Disabled)  
> **السبب:** تحتاج إلى إعداد VAPID keys وتطبيق migration على قاعدة البيانات  
> **لإعادة التفعيل:** اتبع الخطوات أدناه ثم ألغ التعليق عن `PushNotificationsModule` في `apps/api/src/app.module.ts`

تم تنفيذ نظام إشعارات المتصفح الكامل. اتبع هذه الخطوات للتفعيل:

## ✅ 1. إنشاء VAPID Keys

VAPID Keys مطلوبة للتواصل مع خدمة Push Notifications في المتصفح.

### الخيار 1: استخدام أداة أونلاين (الأسهل)
1. اذهب إلى: https://tools.reactpwa.com/vapid-key-generator
2. انقر على "Generate VAPID Keys"
3. ستحصل على:
   - **Public Key** (مثل: `BBQxxx...`)
   - **Private Key** (مثل: `xxxyyy...`)

### الخيار 2: استخدام npm (الأفضل للإنتاج)
```bash
# في مجلد المشروع
npx web-push generate-vapid-keys
```

ستحصل على:
```
Public Key: BBQxxx...
Private Key: xxxyyy...
```

---

## ✅ 2. إضافة Keys إلى .env

### في `/apps/api/.env`:
```env
VAPID_PUBLIC_KEY="BBQxxx..." # من الخطوة 1
VAPID_PRIVATE_KEY="xxxyyy..."  # من الخطوة 1
VAPID_SUBJECT="mailto:notifications@rukny.work"
```

### في `/apps/web/.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BBQxxx..." # نفس المفتاح العام من أعلاه
```

---

## ✅ 3. تثبيت المكتبات المطلوبة

### Backend (NestJS):
```bash
cd apps/api
npm install web-push
npm install --save-dev @types/web-push
```

### Frontend (Next.js):
```bash
cd apps/web
npm install web-push  # موجود عادة
```

---

## ✅ 4. تسجيل الـ Module في API

في `/apps/api/src/app.module.ts`، أضف:

```typescript
import { PushNotificationsModule } from '@/integrations/push-notifications/push-notifications.module';

@Module({
  imports: [
    // ... other imports
    PushNotificationsModule,
  ],
})
export class AppModule {}
```

---

## ✅ 5. تطبيق Migration في Prisma

```bash
cd apps/api

# تطبيق الـ migration الجديد
npx prisma migrate deploy

# أو في التطوير:
npx prisma db push
```

---

## 🎯 الاستخدام

### على الموبايل/سطح المكتب:

1. **فتح صفحة الإعدادات → الإشعارات**
2. **كليك على "إشعارات المتصفح"**
3. **السماح بالإشعارات عند ظهور الطلب**
4. **تم! ستستقبل الإشعارات الآن**

---

## 📝 API Endpoints

### تسجيل الاشتراك:
```
POST /api/v1/push-subscriptions/subscribe
Content-Type: application/json

{
  "endpoint": "https://...",
  "keys": {
    "auth": "...",
    "p256dh": "..."
  }
}
```

### الحصول على الاشتراكات:
```
GET /api/v1/push-subscriptions
```

### إلغاء الاشتراك:
```
POST /api/v1/push-subscriptions/unsubscribe
Content-Type: application/json

{
  "endpoint": "https://..."
}
```

---

## 🔧 إرسال إشعارات من الـ Backend

```typescript
import { PushSubscriptionService } from '@/integrations/push-notifications/push-subscription.service';

constructor(private pushService: PushSubscriptionService) {}

async sendNotification() {
  const result = await this.pushService.sendPushToUser(userId, {
    title: 'إشعار جديد',
    body: 'لديك طلب جديد',
    icon: '/icon-192.png',
    data: {
      url: '/app/orders/123',
      action: 'view-order'
    }
  });
  
  console.log(`Sent to ${result.sent} devices, failed: ${result.failed}`);
}
```

---

## 🛡️ الأمان والخصوصية

- ✅ الإشعارات مشفرة End-to-End
- ✅ لا يتم حفظ محتويات الإشعارات على الخوادم
- ✅ يمكن للمستخدمين إلغاء الاشتراك في أي وقت
- ✅ جميع subscriptions محفوظة بشكل آمن في الـ database

---

## 🐛 استكشاف الأخطاء

### المتصفح لا يدعم الإشعارات:
```
متصفحك (أو جهازك) لا يدعم Web Push Notifications
متصفحات مدعومة: Chrome, Firefox, Edge, Opera
```

### "تم رفض الإذن":
- افتح إعدادات المتصفح
- السماح بالإشعارات للموقع

### "فشل تسجيل الخدمة":
- تأكد من استخدام HTTPS
- فعّل Service Workers في إعدادات المتصفح

---

## 📊 المعلومات التقنية

### Database Schema:
```prisma
model PushSubscription {
  id          String   @id
  userId      String
  endpoint    String   @unique
  auth        String
  p256dh      String
  isActive    Boolean
  createdAt   DateTime
  updatedAt   DateTime
  lastUsedAt  DateTime?
}
```

### Service Worker سيتحول:
- `public/service-worker.js` - يتعامل مع الإشعارات الواردة

---

## ✨ الميزات المتقدمة (اختيارية)

### إرسال إشعارات مجموعية:
```typescript
const result = await this.pushService.broadcastPush({
  title: 'تحديث جديد',
  body: 'نسخة جديدة من التطبيق متاحة'
});
```

### تنظيف الاشتراكات المعطلة:
```typescript
const count = await this.pushService.cleanupInactiveSubscriptions();
```

---

## ❓ الأسئلة الشائعة

**س: متى سأطلب الإذن من المستخدم؟**
ج: الطلب يظهر عند الضغط على زر "تفعيل إشعارات المتصفح"

**س: هل يعمل بدون الإنترنت؟**
ج: لا، يحتاج الإنترنت دائماً (يتواصل مع خوادم المتصفح)

**س: هل يعمل في الخلفية؟**
ج: نعم! تظهر الإشعارات حتى لو كان التطبيق مغلقاً

**س: هل آمن تماماً؟**
ج: نعم، مشفر End-to-End وعالي الأمان
