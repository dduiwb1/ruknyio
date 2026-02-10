# 🏗️ تقسيم المشروع إلى Microservices

## الرؤية العامة

تقسيم مشروع Rukny.io من monolith إلى معمارية microservices:

```
┌─────────────────────────────────────────────────────────┐
│                   Rukny.io                              │
├─────────────────────────────────────────────────────────┤
│  Web (Next.js - Port 3000)                              │
│  ├── rukny.io (الموقع الرئيسي)                          │
│  └── dashboard.rukny.io (لوحة التحكم)                  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐    ┌─────────────────────┐     │
│ │  AUTH SERVICE       │    │  API SERVICE        │     │
│ │ auth.rukny.io       │    │ dev.rukny.io        │     │
│ ├─────────────────────┤    ├─────────────────────┤     │
│ │ Port: 3001          │    │ Port: 3002          │     │
│ │ - تسجيل دخول       │    │ - البيانات/المنتجات │     │
│ │ - تسجيل حساب        │    │ - الطلبات            │     │
│ │ - إدارة الجلسات     │    │ - الأحداث            │     │
│ │ - التحقق من البريد  │    │ - المتاجر            │     │
│ │ - إعادة تعيين الرمز │    │ - التحليلات          │     │
│ └─────────────────────┘    └─────────────────────┘     │
│         ↓                              ↓                │
│    JWT Token                  HTTP + Bearer Token       │
│         ↓                              ↓                │
│    Web Frontend ←──────────────────────────             │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 البنية الجديدة للمشروع

```
Rukny.io/
├── apps/
│   ├── web/                    # مستقل - Next.js Frontend
│   ├── auth/                   # خدمة جديدة - NestJS - Port 3001
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   └── forgot-password.controller.ts
│   │   │   │   ├── services/
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── local.strategy.ts
│   │   │   │   └── auth.module.ts
│   │   │   ├── users/
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   └── users.module.ts
│   │   │   ├── email/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma (مشترك)
│   │   │   └── migrations/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                    # خدمة API - NestJS - Port 3000
│       ├── src/
│       │   ├── auth/          # JWT Verification Guard فقط
│       │   ├── products/
│       │   ├── orders/
│       │   ├── events/
│       │   ├── stores/
│       │   ├── analytics/
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── prisma/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── database/              # Prisma Schema مشترك
│   ├── types/                 # Types مشترك
│   └── ui/                    # UI Components مشترك
│
├── docker-compose.yml         # قاعدة البيانات والـ Redis فقط
├── docker-compose.auth.yml    # Auth Service
├── docker-compose.api.yml     # API Service
├── docker-compose.full.yml    # جميع الخدمات معاً
│
├── docs/
│   ├── MICROSERVICES_ARCHITECTURE.md   # هذا الملف
│   ├── SERVICE_COMMUNICATION.md        # التواصل بين الخدمات
│   └── DEPLOYMENT_MICROSERVICES.md     # نشر الخدمات
│
└── ...
```

---

## 🔐 Auth Service (auth.rukny.io)

### الغرض
- تسجيل الدخول والتسجيل
- إصدار JWT Tokens
- التحقق من البريد الإلكتروني
- إعادة تعيين كلمات المرور
- إدارة جلسات المستخدم
- إدارة البروفايل الأساسية

### Endpoints

```
POST   /auth/register          - تسجيل حساب جديد
POST   /auth/login             - تسجيل دخول
POST   /auth/refresh           - تحديث JWT Token
POST   /auth/logout            - تسجيل خروج
POST   /auth/forgot-password   - طلب إعادة تعيين كلمة المرور
POST   /auth/reset-password    - إعادة تعيين كلمة المرور
POST   /auth/verify-email      - التحقق من البريد
POST   /auth/resend-email      - إعادة إرسال البريد
GET    /auth/me                - الحصول على بيانات المستخدم الحالي
PUT    /auth/profile           - تحديث الملف الشخصي
```

### متغيرات البيئة

```env
# Auth Service
AUTH_SERVICE_PORT=3001
AUTH_SERVICE_URL=http://localhost:3001
AUTH_SERVICE_EXTERNAL_URL=https://auth.rukny.io

# Database (مشترك)
DATABASE_URL=postgresql://rukny_admin:password@localhost:5432/rukny_io

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=30d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
SMTP_FROM=noreply@rukny.io

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:3002,https://rukny.io,https://dev.rukny.io

# Redis (للـ Session Management)
REDIS_URL=redis://localhost:6379
```

---

## 🚀 API Service (dev.rukny.io)

### الغرض
- إدارة المنتجات والمتاجر
- إدارة الطلبات والعمليات
- إدارة الأحداث والتذاكر
- التحليلات والإحصائيات
- الملفات والتحميلات

### Endpoints (نموذج)

```
GET    /api/v1/products        - قائمة المنتجات
POST   /api/v1/products        - إنشاء منتج
GET    /api/v1/stores          - المتاجر
POST   /api/v1/orders          - إنشاء طلب
GET    /api/v1/events          - الأحداث
POST   /api/v1/analytics       - إرسال بيانات التحليل
```

### متغيرات البيئة

```env
# API Service
API_SERVICE_PORT=3000
API_SERVICE_URL=http://localhost:3000
API_SERVICE_EXTERNAL_URL=https://dev.rukny.io

# Database (مشترك)
DATABASE_URL=postgresql://rukny_admin:password@localhost:5432/rukny_io

# Auth Service Integration
AUTH_SERVICE_URL=http://localhost:3001
AUTH_SERVICE_JWT_SECRET=same_as_auth_service

# AWS S3 (للملفات)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=rukny-uploads
AWS_REGION=us-east-1

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3002,https://rukny.io,https://dev.rukny.io
```

---

## 🔗 التواصل بين الخدمات

### 1️⃣ Web → Auth Service (تسجيل الدخول)

```typescript
// Frontend (Next.js)
const response = await fetch('https://auth.rukny.io/auth/login', {
  method: 'POST',
  credentials: 'include', // للـ cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken, refreshToken } = await response.json();
// حفظ الـ tokens في localStorage أو cookie
localStorage.setItem('accessToken', accessToken);
```

### 2️⃣ Web → API Service (استخدام البيانات)

```typescript
// Frontend (Next.js)
const response = await fetch('https://dev.rukny.io/api/v1/products', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### 3️⃣ API Service → Auth Service (التحقق من Token)

```typescript
// NestJS API Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException();

    try {
      // التحقق من الـ Token مباشرة من Auth Service
      const response = await fetch('http://auth:3001/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (!response.ok) throw new UnauthorizedException();

      const userData = await response.json();
      request.user = userData;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
```

---

## 🐳 Docker Compose Configuration

### 1. `docker-compose.base.yml` (الخدمات المشتركة)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: rukny_postgres
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - rukny_network

  redis:
    image: redis:7-alpine
    container_name: rukny_redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - rukny_network

volumes:
  postgres_data:
  redis_data:

networks:
  rukny_network:
    driver: bridge
```

### 2. `docker-compose.auth.yml` (خدمة Auth)

```yaml
version: '3.8'

services:
  auth:
    build:
      context: .
      dockerfile: apps/auth/Dockerfile
    container_name: rukny_auth
    environment:
      NODE_ENV: ${NODE_ENV}
      AUTH_SERVICE_PORT: 3001
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
    ports:
      - '3001:3001'
    depends_on:
      - postgres
      - redis
    networks:
      - rukny_network
    restart: unless-stopped
    volumes:
      - ./apps/auth/src:/app/src

networks:
  rukny_network:
    driver: bridge
```

### 3. `docker-compose.api.yml` (خدمة API)

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: rukny_api
    environment:
      NODE_ENV: ${NODE_ENV}
      API_SERVICE_PORT: 3000
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
      AUTH_SERVICE_URL: http://auth:3001
      JWT_SECRET: ${JWT_SECRET}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    ports:
      - '3000:3000'
    depends_on:
      - postgres
      - redis
      - auth
    networks:
      - rukny_network
    restart: unless-stopped
    volumes:
      - ./apps/api/src:/app/src

networks:
  rukny_network:
    driver: bridge
```

### 4. `docker-compose.full.yml` (جميع الخدمات)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: rukny_postgres
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - rukny_network

  redis:
    image: redis:7-alpine
    container_name: rukny_redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - rukny_network

  auth:
    build:
      context: .
      dockerfile: apps/auth/Dockerfile
    container_name: rukny_auth
    environment:
      NODE_ENV: ${NODE_ENV}
      AUTH_SERVICE_PORT: 3001
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - '3001:3001'
    depends_on:
      - postgres
      - redis
    networks:
      - rukny_network

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: rukny_api
    environment:
      NODE_ENV: ${NODE_ENV}
      API_SERVICE_PORT: 3000
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
      AUTH_SERVICE_URL: http://auth:3001
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - '3000:3000'
    depends_on:
      - postgres
      - redis
      - auth
    networks:
      - rukny_network

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: rukny_web
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000
      NEXT_PUBLIC_AUTH_URL: http://localhost:3001
    ports:
      - '3002:3000'
    depends_on:
      - api
      - auth
    networks:
      - rukny_network

volumes:
  postgres_data:
  redis_data:

networks:
  rukny_network:
    driver: bridge
```

---

## 🚀 خطوات التنفيذ

### المرحلة 1: إعداد البنية (Week 1)

```bash
# 1. إنشاء مجلد auth
mkdir -p apps/auth/src apps/auth/prisma

# 2. نسخ الملفات الأساسية
cp apps/api/package.json apps/auth/
cp apps/api/tsconfig.json apps/auth/
cp apps/api/prisma/schema.prisma apps/auth/prisma/

# 3. تعديل Auth Module
# - حذف جميع الـ modules ما عدا Auth, Users, Email
# - حذف Database services الأخرى
```

### المرحلة 2: فصل الكود (Week 2-3)

```typescript
// apps/auth/src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(ormconfig),
    AuthModule,
    UsersModule,
    EmailModule,
    ThrottlerModule.forRoot(throttlerConfig),
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerUserGuard },
  ],
})
export class AppModule {}

// apps/api/src/app.module.ts - فقط بدون Auth الكامل
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(ormconfig),
    JwtModule.register({ global: true }),
    ProductsModule,
    OrdersModule,
    EventsModule,
    StoresModule,
    AnalyticsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // يتحقق من Token فقط
  ],
})
export class AppModule {}
```

### المرحلة 3: التكامل (Week 4)

```bash
# 1. تحديث .env
# 2. بناء صور Docker
docker-compose -f docker-compose.full.yml build

# 3. تشغيل الخدمات
docker-compose -f docker-compose.full.yml up

# 4. تشغيل الـ Migrations
docker-compose -f docker-compose.full.yml exec auth npm run migrate
```

### المرحلة 4: الاختبار والنشر (Week 5)

```bash
# اختبار الـ Endpoints
curl http://localhost:3001/auth/register -d '...'
curl http://localhost:3000/api/v1/products -H 'Authorization: Bearer ...'
```

---

## 🔑 Safety Checklist

- [ ] قاعدة البيانات مشتركة بينهما
- [ ] JWT Key موحد بينهما
- [ ] متغيرات البيئة محفوظة بشكل آمن
- [ ] CORS مُعدّل بشكل صحيح
- [ ] اختبار التواصل بين الخدمات
- [ ] نسخة احتياطية من البيانات
- [ ] Monitoring و Logging مُعداً

---

## 📚 ملفات إضافية مطلوبة

1. **SERVICE_COMMUNICATION.md** - تفاصيل البروتوكول
2. **DEPLOYMENT_MICROSERVICES.md** - نشر على Railway/Vercel
3. **Dockerfile** لكل خدمة
4. **.env.example** محدث
5. **nginx.conf** - Reverse Proxy (اختياري)

