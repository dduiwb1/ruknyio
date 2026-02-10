# 🚀 دليل نشر Rukny.io على Vercel + Railway

## 📋 فهرس المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المتطلبات](#المتطلبات)
3. [إعداد Railway (Backend + Database)](#إعداد-railway)
4. [إعداد Vercel (Frontend)](#إعداد-vercel)
5. [إعداد Supabase (Auth + Storage)](#إعداد-supabase)
6. [ربط الخدمات](#ربط-الخدمات)
7. [إعداد الدومين](#إعداد-الدومين)
8. [CI/CD التلقائي](#cicd-التلقائي)
9. [المراقبة والتحليلات](#المراقبة-والتحليلات)
10. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🎯 نظرة عامة

### البنية النهائية

```
┌─────────────────────────────────────────────────────────┐
│                      Cloudflare                          │
│                 (DNS + CDN + DDoS Protection)            │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
    ┌───────────────┐               ┌───────────────┐
    │    Vercel     │               │   Railway     │
    │   Next.js     │◄─────────────►│   NestJS      │
    │  rukny.io     │   API Calls   │ api.rukny.io  │
    │               │               │               │
    │ ✅ SSR/SSG    │               │ ✅ REST API   │
    │ ✅ Edge Func  │               │ ✅ WebSocket  │
    │ ✅ Auto SSL   │               │ ✅ Prisma     │
    └───────────────┘               └───────┬───────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
            ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
            │  PostgreSQL   │       │   Supabase    │       │   Supabase    │
            │   (Railway)   │       │     Auth      │       │    Storage    │
            │               │       │               │       │               │
            │ ✅ Prisma ORM │       │ ✅ JWT Auth   │       │ ✅ Images     │
            │ ✅ Auto Backup│       │ ✅ OAuth      │       │ ✅ Files      │
            └───────────────┘       └───────────────┘       └───────────────┘
```

### التكلفة المتوقعة

| الخدمة | الخطة | التكلفة |
|--------|-------|---------|
| Vercel | Pro | $20/شهر |
| Railway | Starter | $5-15/شهر |
| Supabase | Free/Pro | $0-25/شهر |
| Cloudflare | Free | $0 |
| **المجموع** | - | **$25-60/شهر** |

---

## 📦 المتطلبات

### حسابات مطلوبة

- [ ] حساب [GitHub](https://github.com)
- [ ] حساب [Vercel](https://vercel.com)
- [ ] حساب [Railway](https://railway.app)
- [ ] حساب [Supabase](https://supabase.com)
- [ ] حساب [Cloudflare](https://cloudflare.com) (اختياري)
- [ ] دومين (مثل: rukny.io)

### أدوات محلية

```bash
# التحقق من Node.js
node --version  # يجب أن يكون 18+

# التحقق من pnpm
pnpm --version

# تثبيت Vercel CLI
npm install -g vercel

# تثبيت Railway CLI
npm install -g @railway/cli
```

---

## 🚂 إعداد Railway

### الخطوة 1: إنشاء مشروع جديد

1. اذهب إلى [railway.app](https://railway.app)
2. سجل الدخول باستخدام GitHub
3. اضغط **New Project**
4. اختر **Deploy from GitHub repo**
5. اختر مستودع `Rukny.io`

### الخطوة 2: إضافة PostgreSQL

1. داخل المشروع، اضغط **+ New**
2. اختر **Database** → **Add PostgreSQL**
3. انتظر حتى يتم الإنشاء
4. اضغط على PostgreSQL → **Variables**
5. انسخ `DATABASE_URL`

### الخطوة 3: إعداد خدمة API

1. اضغط **+ New** → **GitHub Repo**
2. اختر نفس المستودع
3. في الإعدادات:

```yaml
# Settings → General
Root Directory: apps/api
Build Command: pnpm install && pnpm prisma generate && pnpm build
Start Command: node dist/main.js
```

### الخطوة 4: متغيرات البيئة للـ API

اذهب إلى **Variables** وأضف:

```env
# App
NODE_ENV=production
PORT=4000

# Database (يتم ربطها تلقائياً من PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRATION=7d

# CORS
CORS_ORIGINS=https://rukny.io,https://www.rukny.io

# Upload
MAX_FILE_SIZE=10485760
```

### الخطوة 5: إعداد الدومين

1. اذهب إلى **Settings** → **Networking**
2. اضغط **Generate Domain** أو **Custom Domain**
3. أضف: `api.rukny.io`

### الخطوة 6: تشغيل Prisma Migrations

```bash
# من Terminal المحلي
cd apps/api

# تسجيل الدخول لـ Railway
railway login

# ربط المشروع
railway link

# تشغيل migrations
railway run pnpm prisma migrate deploy

# (اختياري) تعبئة بيانات أولية
railway run pnpm prisma db seed
```

---

## ▲ إعداد Vercel

### الخطوة 1: ربط المستودع

1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط **Add New** → **Project**
3. اختر مستودع `Rukny.io` من GitHub
4. في الإعدادات:

```yaml
Framework Preset: Next.js
Root Directory: apps/web
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

### الخطوة 2: متغيرات البيئة

اذهب إلى **Settings** → **Environment Variables**:

```env
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://rukny.io
NEXT_PUBLIC_API_URL=https://api.rukny.io

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Analytics (اختياري)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### الخطوة 3: إعداد الدومين

1. اذهب إلى **Settings** → **Domains**
2. أضف:
   - `rukny.io`
   - `www.rukny.io`
3. اتبع التعليمات لإضافة DNS records

### الخطوة 4: إعدادات إضافية

#### تحديث `next.config.ts`:

```typescript
// apps/web/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // مهم للـ Vercel
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'api.rukny.io',
      },
    ],
  },

  // Headers للأمان
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Rewrites للـ API (اختياري)
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.rukny.io/:path*',
      },
    ];
  },
};

export default nextConfig;
```

---

## 🚂 نشر الويب على Railway (Rukny-web) — حل "Application failed to respond"

إذا كنت تنشر **الواجهة الأمامية (Next.js)** على Railway كخدمة **Rukny-web** وظهرت رسالة **"Application failed to respond"**، السبب غالباً أن أمر التشغيل يعمل من جذر المستودع بينما مجلد البناء `.next` موجود داخل `apps/web`. يجب أن يعمل `next start` من مجلد `apps/web`.

### الإعداد الصحيح لخدمة Rukny-web

في لوحة Railway → اختر خدمة **Rukny-web** → **Settings**:

**الخيار الأول (مُفضّل):**

| الإعداد | القيمة |
|--------|--------|
| **Root Directory** | `apps/web` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |

**الخيار الثاني (جذر المستودع):**

| الإعداد | القيمة |
|--------|--------|
| **Root Directory** | *(اتركه فارغاً)* |
| **Build Command** | `npm install && npm run build:web` |
| **Start Command** | `cd apps/web && npx next start` |

### متغيرات البيئة لـ Rukny-web (Variables)

```env
NEXT_PUBLIC_APP_URL=https://rukny.io
NEXT_PUBLIC_API_EXTERNAL_URL=https://auth.rukny.io/api/v1
API_BACKEND_URL=https://auth.rukny.io
```

Railway يضبط `PORT` تلقائياً؛ Next.js يقرأه ولا حاجة لتعيينه يدوياً.

### بعد التعديل

1. احفظ الإعدادات ثم **Redeploy**.
2. راجع **Deploy Logs** و **Build Logs** للتأكد من عدم ظهور أخطاء.

---

## 🔐 إعداد Supabase

### الخطوة 1: إنشاء مشروع

1. اذهب إلى [supabase.com](https://supabase.com)
2. اضغط **New Project**
3. أدخل:
   - **Name**: `rukny-production`
   - **Region**: اختر الأقرب لمستخدميك
   - **Password**: كلمة مرور قوية

### الخطوة 2: الحصول على المفاتيح

1. اذهب إلى **Settings** → **API**
2. انسخ:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### الخطوة 3: إعداد Authentication

1. اذهب إلى **Authentication** → **Providers**
2. فعّل المزودين المطلوبين:
   - ✅ Email
   - ✅ Google (اختياري)
   - ✅ GitHub (اختياري)

#### إعداد Google OAuth:

```
1. اذهب إلى Google Cloud Console
2. أنشئ OAuth 2.0 Client
3. أضف Redirect URI:
   https://xxxxx.supabase.co/auth/v1/callback
4. انسخ Client ID و Client Secret
5. أضفهم في Supabase
```

### الخطوة 4: إعداد Storage

1. اذهب إلى **Storage**
2. أنشئ Buckets:

```sql
-- أو من SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('products', 'products', true),
  ('events', 'events', true),
  ('forms', 'forms', false);
```

3. أضف Policies:

```sql
-- سياسة للصور العامة
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id IN ('avatars', 'products', 'events'));

-- سياسة للرفع للمستخدمين المسجلين
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### الخطوة 5: إعداد الـ URL في التطبيقات

#### في Vercel (Frontend):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

#### في Railway (Backend):

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 🔗 ربط الخدمات

### 1. إعداد CORS في Backend

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS Configuration
  app.enableCors({
    origin: [
      'https://rukny.io',
      'https://www.rukny.io',
      'http://localhost:3000', // للتطوير
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
```

### 2. إعداد API Client في Frontend

```typescript
// apps/web/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rukny.io';

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

### 3. التحقق من الربط

```bash
# من Terminal
curl https://api.rukny.io/health

# يجب أن يرجع
{"status":"ok","timestamp":"..."}
```

---

## 🌐 إعداد الدومين

### باستخدام Cloudflare (مُوصى)

#### الخطوة 1: إضافة الدومين

1. اذهب إلى [Cloudflare Dashboard](https://dash.cloudflare.com)
2. اضغط **Add a Site**
3. أدخل دومينك: `rukny.io`
4. اختر خطة Free

#### الخطوة 2: تحديث Nameservers

1. انسخ Cloudflare nameservers
2. اذهب لمسجل الدومين (GoDaddy, Namecheap, etc.)
3. غيّر nameservers إلى Cloudflare

#### الخطوة 3: إضافة DNS Records

```
Type    Name    Content                         Proxy
─────────────────────────────────────────────────────
CNAME   @       cname.vercel-dns.com           ✅
CNAME   www     cname.vercel-dns.com           ✅
CNAME   api     xxxxx.up.railway.app           ✅
```

#### الخطوة 4: إعدادات SSL

1. اذهب إلى **SSL/TLS**
2. اختر **Full (strict)**
3. فعّل **Always Use HTTPS**

#### الخطوة 5: إعدادات الأداء

```
# Page Rules
rukny.io/*
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

# أو باستخدام Cache Rules الجديدة
```

---

## ⚡ CI/CD التلقائي

### GitHub Actions Workflow

أنشئ ملف `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # ===== Lint & Type Check =====
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm lint
        
      - name: Type Check
        run: pnpm type-check

  # ===== Test =====
  test:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      
      - name: Run Tests
        run: pnpm test

  # ===== Deploy API to Railway =====
  deploy-api:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
        
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: railway up --service api

  # ===== Deploy Web to Vercel =====
  deploy-web:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/web
          vercel-args: '--prod'
```

### إعداد Secrets في GitHub

1. اذهب إلى **Settings** → **Secrets and variables** → **Actions**
2. أضف:

```
RAILWAY_TOKEN     # من Railway → Account → Tokens
VERCEL_TOKEN      # من Vercel → Settings → Tokens
VERCEL_ORG_ID     # من .vercel/project.json
VERCEL_PROJECT_ID # من .vercel/project.json
```

---

## 📊 المراقبة والتحليلات

### 1. Vercel Analytics

```typescript
// apps/web/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 2. Railway Metrics

- اذهب إلى Railway Dashboard
- اضغط على الخدمة
- شاهد **Metrics**: CPU, Memory, Network

### 3. Sentry للأخطاء (اختياري)

```bash
# تثبيت
pnpm add @sentry/nextjs

# إعداد
npx @sentry/wizard@latest -i nextjs
```

### 4. Uptime Monitoring

استخدم [UptimeRobot](https://uptimerobot.com) (مجاني):

```
Monitor 1: https://rukny.io (HTTPS)
Monitor 2: https://api.rukny.io/health (HTTPS)
Alert: Email + Telegram
```

---

## 🔧 استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### 1. خطأ CORS

```typescript
// تأكد من إعداد CORS في NestJS
app.enableCors({
  origin: ['https://rukny.io'],
  credentials: true,
});
```

#### 2. خطأ Prisma في Railway

```bash
# أضف postinstall script في package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

#### 3. خطأ Build في Vercel

```bash
# تحقق من الإعدادات
Root Directory: apps/web
Build Command: cd ../.. && pnpm build --filter=web
```

#### 4. متغيرات البيئة غير موجودة

```bash
# Vercel: تأكد من إضافتها لكل البيئات
Production ✅
Preview ✅
Development ✅
```

#### 5. خطأ في Supabase Auth

```typescript
// تأكد من Site URL في Supabase
// Authentication → URL Configuration
Site URL: https://rukny.io
Redirect URLs: https://rukny.io/auth/callback
```

---

## 📝 قائمة التحقق للنشر

### Railway (Backend)
- [ ] إنشاء مشروع Railway
- [ ] إضافة PostgreSQL
- [ ] إعداد خدمة API
- [ ] إضافة متغيرات البيئة
- [ ] تشغيل Prisma migrations
- [ ] إعداد الدومين (api.rukny.io)
- [ ] التحقق من Health endpoint

### Vercel (Frontend)
- [ ] ربط المستودع
- [ ] إعداد Root Directory
- [ ] إضافة متغيرات البيئة
- [ ] إعداد الدومين (rukny.io)
- [ ] تفعيل Analytics

### Supabase
- [ ] إنشاء مشروع
- [ ] الحصول على المفاتيح
- [ ] إعداد Authentication
- [ ] إنشاء Storage Buckets
- [ ] إضافة Policies

### Cloudflare
- [ ] إضافة الدومين
- [ ] تحديث Nameservers
- [ ] إضافة DNS Records
- [ ] إعداد SSL
- [ ] تفعيل Caching

### الاختبار النهائي
- [ ] فتح https://rukny.io
- [ ] تسجيل مستخدم جديد
- [ ] تسجيل الدخول
- [ ] رفع صورة
- [ ] إنشاء منتج/نموذج
- [ ] التحقق من الإشعارات

---

## 🎉 مبروك!

مشروعك الآن منشور على:
- 🌐 **Frontend**: https://rukny.io
- 🔌 **API**: https://api.rukny.io

### موارد إضافية

| المصدر | الرابط |
|--------|--------|
| Vercel Docs | [vercel.com/docs](https://vercel.com/docs) |
| Railway Docs | [docs.railway.app](https://docs.railway.app) |
| Supabase Docs | [supabase.com/docs](https://supabase.com/docs) |
| Prisma Docs | [prisma.io/docs](https://prisma.io/docs) |

---

*آخر تحديث: 4 يناير 2026*
