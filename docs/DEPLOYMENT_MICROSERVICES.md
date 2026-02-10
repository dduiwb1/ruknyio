# 📦 نشر Microservices على Railway / Vercel

## 🎯 الرؤية العامة للنشر

```
┌──────────────────────────────────────────────────────────┐
│  Vercel                                   Railway       │
├──────────────────────────────────────────────────────────┤
│  rukny.io          ┌────────────────────┐               │
│  (Web Frontend)    │   Database         │               │
│                    │   (PostgreSQL)     │               │
│  dashboard.        │                    │               │
│  rukny.io          └────────────────────┘               │
│                                                          │
│  ┌─────────────────────────────────────────┐           │
│  │ API Services                            │           │
│  ├─────────────────────────────────────────┤           │
│  │                                         │           │
│  │  auth.rukny.io (Port 3001)             │           │
│  │  ├── /auth/login                        │           │
│  │  ├── /auth/register                     │           │
│  │  └── /auth/verify-token                 │           │
│  │                                         │           │
│  │  dev.rukny.io (Port 3000)              │           │
│  │  ├── /api/v1/products                   │           │
│  │  ├── /api/v1/orders                     │           │
│  │  └── /api/v1/analytics                  │           │
│  │                                         │           │
│  └─────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 الخطوة 1: إعداد Repository

### 1.1 بنية المشروع في Git

```bash
Rukny.io/
├── .github/
│   └── workflows/
│       ├── deploy-auth.yml
│       ├── deploy-api.yml
│       └── deploy-web.yml
├── apps/
│   ├── auth/
│   ├── api/
│   ├── web/
│   └── ...
├── docker/
│   ├── Dockerfile.auth
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── .dockerignore
├── .env.example
├── .env.production
└── ...
```

### 1.2 ملفات Environment

فائمة: `.env.production`

```env
# Shared Config
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@db.railway.app:5432/rukny_production
REDIS_URL=redis://cache.railway.app:6379

# Auth Service
AUTH_SERVICE_PORT=3001
AUTH_SERVICE_URL=https://auth.rukny.io
JWT_SECRET=your_production_secret_min_32_chars
JWT_EXPIRATION=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# API Service
API_SERVICE_PORT=3000
API_SERVICE_URL=https://dev.rukny.io
AUTH_SERVICE_INTERNAL_URL=https://auth.rukny.io

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=rukny-prod
AWS_REGION=us-east-1

# CORS
CORS_ORIGINS=https://rukny.io,https://auth.rukny.io,https://dev.rukny.io,https://dashboard.rukny.io

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

---

## 🐳 الخطوة 2: Docker Configuration

### 2.1 Dockerfile للـ Auth Service

ملف: `docker/Dockerfile.auth`

```dockerfile
# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY apps/auth/package.json apps/auth/package-lock.json ./apps/auth/

# Install dependencies
RUN npm ci

# Copy source
COPY apps/auth ./apps/auth
COPY packages ./packages

# Build
WORKDIR /app/apps/auth
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json package-lock.json ./
COPY apps/auth/package.json apps/auth/package-lock.json ./apps/auth/

# Install production dependencies only
RUN npm ci --only=production

# Copy built files
COPY --from=builder /app/apps/auth/dist ./apps/auth/dist
COPY --from=builder /app/packages ./packages

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["node", "apps/auth/dist/main.js"]
```

### 2.2 Dockerfile للـ API Service

ملف: `docker/Dockerfile.api`

```dockerfile
# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package-lock.json ./apps/api/

RUN npm ci

COPY apps/api ./apps/api
COPY packages ./packages

WORKDIR /app/apps/api
RUN npm run build
RUN npx prisma generate

# Production Stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package-lock.json ./apps/api/

RUN npm ci --only=production

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules/@prisma ./apps/api/node_modules/@prisma
COPY --from=builder /app/packages ./packages

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["node", "apps/api/dist/main.js"]
```

### 2.3 .dockerignore

```
node_modules
.git
.gitignore
.env
.env.*
dist
build
.next
*.log
.DS_Store
README.md
CHANGELOG.md
.editorconfig
.prettierrc
.eslintrc*
*.test.ts
test/
```

---

## 🚂 الخطوة 3: نشر على Railway

### 3.1 إعداد قاعدة البيانات

```bash
# 1. إذهب إلى railway.app
# 2. إنشاء Project جديد
# 3. أضف PostgreSQL
# 4. احصل على DATABASE_URL

# عند الاتصال:
# postgresql://user:pass@db.railway.app:5432/production
```

### 3.2 نشر Auth Service

```bash
# 1. Connect Railway مع GitHub repo
# 2. إنشاء Service جديد من Dockerfile

# في Railway Dashboard:
Settings → Build → Dockerfile: docker/Dockerfile.auth

# متغيرات البيئة:
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=...
REDIS_URL=...
```

### 3.3 نشر API Service

```bash
# نفس الخطوات لكن مع:
# Dockerfile: docker/Dockerfile.api
# PORT=3000
```

### 3.4 إعدادات الشبكة

```yaml
# railway.yml
services:
  postgres:
    image: postgres:14
    variables:
      POSTGRES_DB: rukny_prod
  
  redis:
    image: redis:7-alpine
  
  auth:
    build: ./docker/Dockerfile.auth
    depends_on:
      - postgres
      - redis
    start: npm run start:prod
    environment:
      PORT: 3001
  
  api:
    build: ./docker/Dockerfile.api
    depends_on:
      - postgres
      - auth
    start: npm run start:prod
    environment:
      PORT: 3000
```

---

## 🌐 الخطوة 4: تكوين النطاقات (Domains)

### 4.1 Cloudflare DNS Setup

```
Subdomain          Type    Value
──────────────────────────────────────────
auth               CNAME   auth-prod.railway.app
dev                CNAME   api-prod.railway.app
```

### 4.2 Railway Custom Domains

```bash
# في Railway Dashboard لكل service:
# Settings → Domains → Add Domain
# auth.rukny.io → auth-service
# dev.rukny.io → api-service
```

---

## 🔒 الخطوة 5: SSL/TLS

### 5.1 Railway توفر SSL مجاناً

```bash
# تم تلقائياً عند إضافة domain custom
# Rails → Settings → Domains → SSLEnabled ✓
```

### 5.2 إعادة التوجيه HTTP → HTTPS

```nginx
# في Nginx (اختياري):
server {
  listen 80;
  server_name auth.rukny.io;
  return 301 https://$server_name$request_uri;
}
```

---

## 🔐 الخطوة 6: متغيرات البيئة الآمنة

### 6.1 استخدام Railway Secrets

```bash
# عبر CLI:
railway link

# إضافة متغيرات آمنة:
railway variables set JWT_SECRET "your_secret_here"
railway variables set SMTP_PASS "your_password_here"
```

### 6.2 GitHub Secrets (للـ CI/CD)

```bash
# في GitHub Settings → Secrets:
RAILWAY_TOKEN=xxxxx
DOCKER_USERNAME=xxxxx
DOCKER_PASSWORD=xxxxx
```

---

## 🚀 الخطوة 7: GitHub Actions CI/CD

### 7.1 ملف: `.github/workflows/deploy-services.yml`

```yaml
name: Deploy Services

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # Build & Push Auth Service
      - name: Build and push Auth Service
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./docker/Dockerfile.auth
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/auth:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/auth:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # Build & Push API Service
      - name: Build and push API Service
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./docker/Dockerfile.api
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # Deploy to Railway
      - name: Deploy to Railway
        run: |
          # Install Railway CLI
          npm i -g @railway/cli
          
          # Deploy Auth Service
          railway link --projectId ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up --service auth --detach
          
          # Deploy API Service
          railway up --service api --detach
          
          # Run migrations
          railway run npm run migrate
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🧪 الخطوة 8: اختبار بعد النشر

### 8.1 Health Checks

```bash
# Auth Service
curl https://auth.rukny.io/health

# API Service
curl https://dev.rukny.io/health
```

### 8.2 Smoke Tests

```bash
#!/bin/bash

# Test Auth Endpoints
echo "Testing Auth Service..."
curl -X POST https://auth.rukny.io/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@rukny.io",
    "password": "Test123!@",
    "name": "Test User"
  }'

# Test API Endpoints (with token)
echo "Testing API Service..."
TOKEN="your_token_here"
curl -X GET https://dev.rukny.io/api/v1/products \
  -H "Authorization: Bearer $TOKEN"
```

### 8.3 Performance Monitoring

```bash
# اختبر السرعة
time curl https://auth.rukny.io/auth/login

# اختبر الحمل
ab -n 100 -c 10 https://dev.rukny.io/api/v1/products
```

---

## 📊 الخطوة 9: Monitoring & Logging

### 9.1 Railway Logging

```bash
# عرض السجلات
railway logs --service auth
railway logs --service api

# تتبع real-time
railway logs --follow --service api
```

### 9.2 Sentry Integration

```typescript
// apps/auth/src/main.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### 9.3 Health Check Endpoint

```typescript
// apps/auth/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    const db = await this.database.query('SELECT 1');
    const redis = await this.redis.ping();
    
    return {
      status: db && redis ? 'healthy' : 'unhealthy',
      timestamp: new Date(),
      services: {
        database: !!db,
        redis: !!redis,
      }
    };
  }
}
```

---

## 🔄 الخطوة 10: Rollback Strategy

### 10.1 إذا حدثت مشاكل

```bash
# عرض النشرات
railway history

# العودة للنسخة السابقة
railway deploy --redeploy <deployment-id>
```

### 10.2 نسخ احتياطية من قاعدة البيانات

```bash
# في Railway:
# Backup → Create Snapshot
# ثم يمكن الاستعادة من لوحة التحكم
```

---

## ✅ قائمة التحقق

- [ ] الملفات الأساسية والـ Schema مُعران بشكل صحيح
- [ ] متغيرات البيئة آمنة و محفوظة
- [ ] الـ Dockerfile يعمل محلياً
- [ ] Docker images تُبنى بنجاح
- [ ] قاعدة البيانات متصلة
- [ ] التوافق بين الخدمات معروف
- [ ] الـ Health Checks تعمل
- [ ] SSL/TLS مُفعل
- [ ] اختبارات الدخان مُجتازة
- [ ] السجلات والمراقبة مُعدة

