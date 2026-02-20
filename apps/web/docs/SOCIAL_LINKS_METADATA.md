# Social Links Metadata System

## نظام محسّن لجلب الشعارات والعناوين من الروابط الاجتماعية

### المميزات

#### ✅ 1. جلب الشعارات (Favicons)

استخدام Google Favicon API - رابط مباشر لشعار أي موقع:

```typescript
// مثال
const faviconUrl = getGoogleFavicon('https://youtube.com', 64);
// النتيجة: https://www.google.com/s2/favicons?sz=64&domain_url=youtube.com
```

**المميزات:**
- لا يحتاج API Key
- سريع جداً (CDN من Google)
- توافقي مع جميع المتصفحات
- يدعم أحجام مختلفة (32, 64, 128, ...)

#### ✅ 2. كشف المنصات المعروفة

المنصات المدعومة مباشرة (مع شعاراتها الأصلية):
- Instagram (وردي)
- Twitter/X (أزرق)
- LinkedIn (أزرق فاتح)
- YouTube (أحمر)
- GitHub (أسود)
- WhatsApp (أخضر)
- TikTok (أسود)
- المواقع العامة (يمكن)
- البريد الإلكتروني
- الهاتف

#### ✅ 3. استخراج العناوين التلقائي

```typescript
// من الرابط مباشرة
const title = extractTitleFromUrl('https://youtube.com/@username');
// النتيجة: youtube.com
```

#### ✅ 4. Fallback System

النظام يعمل بهذا الترتيب:

1. **المنصات المعروفة** → استخدام الأيقونة المحفوظة
2. **المواقع الأخرى** → جلب Favicon من Google
3. **عند فشل جلب الصورة** → عرض الأيقونة الافتراضية

### الاستخدام الحالي

#### في PublicSocialLinks.tsx:

```typescript
import { getGoogleFavicon } from '@/lib/utils/socialLinkMetadata';

// جلب favicon للرابط
const faviconUrl = getGoogleFavicon(link.url, 64);

// عرضها مع fallback للأيقونة
<img 
  src={faviconUrl}
  onError={(e) => {
    // اخفاء الصورة عند فشل التحميل
    e.target.style.display = 'none';
  }}
/>
```

### خيارات متقدمة (اختيارية)

#### 1. جلب البيانات من Google Custom Search API

```typescript
import { fetchMetadataFromGoogle } from '@/lib/utils/socialLinkMetadata';

const metadata = await fetchMetadataFromGoogle(
  'https://example.com',
  {
    apiKey: 'YOUR_GOOGLE_API_KEY',
    searchEngineId: 'YOUR_SEARCH_ENGINE_ID'
  }
);

console.log(metadata);
// { title: '...', description: '...' }
```

**المتطلبات:**
- Google Cloud Console API Key
- Programmable Search Engine ID
- التفعيل في Backend

#### 2. جلب بيانات Open Graph من Backend

```typescript
import { fetchOpenGraphMetadata } from '@/lib/utils/socialLinkMetadata';

const ogData = await fetchOpenGraphMetadata('https://example.com');
// { title, description, image }
```

**المتطلبات:**
- API endpoint على `/api/metadata?url=...`
- Backend يقرأ HTML ويستخرج meta tags

### الإعدادات المطلوبة

#### 1. Google Favicon (حالياً - بدون إعدادات)
✅ يعمل مباشرة - لا يحتاج إعداد

#### 2. Google Custom Search (اختياري - للبيانات الأفضل)

```bash
# .env.local أو .env
NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY=xxx
NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=xxx
```

#### 3. Backend Metadata API (اختياري - للدقة العالية)

إضافة endpoint على Backend:
```
GET /api/metadata?url=https://example.com

Response:
{
  "title": "...",
  "description": "...",
  "image": "..."
}
```

### الأداء والخصوصية

| الطريقة | السرعة | الخصوصية | الدقة | المتطلبات |
|--------|------|---------|------|----------|
| Google Favicon | ⚡ سريع جداً | ✅ الأفضل | متوسط | لا شيء |
| Google Custom Search | 🟡 متوسط | ⚠️ يرسل search | عالي | API Key |
| Backend Meta Tags | 🟡 متوسط | ✅ آمن | عالي جداً | Backend |

### التوصيات

**للاستخدام الحالي (الأسهل):**
```
✅ Google Favicon API فقط
- لا يحتاج إعدادات
- سريع وموثوق
- يعمل لأي موقع
```

**للمستقبل (أفضل دقة):**
```
✅ Google Favicon + Backend Meta Tags
- شعارات من Google
- بيانات دقيقة من Backend
- خصوصية محمية
```

### أمثلة الاستخدام

#### مثال 1: عرض رابط YouTube

```typescript
const link = {
  id: '1',
  platform: 'youtube',
  url: 'https://youtube.com/@myprofile',
  title: 'قناتي على يوتيوب'
};

// يتم اكتشاف أن المنصة youtube
// يتم جلب favicon من: https://www.google.com/s2/favicons?sz=64&domain_url=youtube.com
// يتم استخدام اللون الأحمر الأصلي
```

#### مثال 2: عرض رابط موقع عام

```typescript
const link = {
  id: '2',
  platform: 'website',
  url: 'https://myportfolio.com',
  title: 'موقعي الشخصي'
};

// يتم جلب favicon من: https://www.google.com/s2/favicons?sz=64&domain_url=myportfolio.com
// عند فشل... يتم عرض أيقونة Globe الافتراضية
```

### Troubleshooting

**Q: الشعار لا يظهر؟**
A: تققق من:
1. الرابط صحيح (`domain_url` parameter)
2. الموقع متاح أونلاين
3. جرب حجم مختلف: `sz=128`

**Q: هل هناك حد أقصى للطلبات؟**
A: Google Favicon API ليس له حد معروف - لكن استخدم caching في Production

**Q: كيف أحسّن الدقة أكثر؟**
A: استخدم Backend Meta Tags API لاستخراج title/description من الصفحة نفسها

### ملفات ذات الصلة

- `src/lib/utils/socialLinkMetadata.ts` - Utility functions
- `src/components/(app)/profile/PublicSocialLinks.tsx` - Social links display
- `apps/api/src/metadata.controller.ts` - Backend metadata API (optional)
