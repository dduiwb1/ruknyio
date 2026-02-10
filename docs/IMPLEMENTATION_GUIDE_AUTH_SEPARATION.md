# 🔧 خطة فصل Auth Module - خطوة بخطوة

## 📋 المرحلة 1: تحضير مجلد Auth

### الخطوة 1.1: نسخ الملفات الأساسية

```bash
# 1. إنشاء البنية الأساسية
mkdir -p apps/auth/src
mkdir -p apps/auth/prisma
mkdir -p apps/auth/test

# 2. نسخ package.json من API وتعديله
cp apps/api/package.json apps/auth/package.json

# 3. نسخ ملفات التكوين
cp apps/api/tsconfig.json apps/auth/
cp apps/api/tsconfig.build.json apps/auth/
cp apps/api/nest-cli.json apps/auth/
cp apps/api/eslint.config.mjs apps/auth/

# 4. نسخ Prisma schema
cp apps/api/prisma/schema.prisma apps/auth/prisma/
```

### الخطوة 1.2: تعديل package.json للـ Auth

**ملف:** `apps/auth/package.json`

```json
{
  "name": "auth",
  "version": "1.0.0",
  "description": "Rukny Auth Service - Authentication & Authorization",
  "author": "Rukny Team",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "deploy": "npm run build",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "migrate": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "migrate:reset": "prisma migrate reset",
    "db:seed": "ts-node prisma/seed.ts",
    "generate": "prisma generate"
  },
  "dependencies": {
    "@nestjs/cache-manager": "^3.0.1",
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^4.0.2",
    "@nestjs/core": "^11.0.1",
    "@nestjs/jwt": "^11.0.1",
    "@nestjs/mailer": "^2.0.2",
    "@nestjs/passport": "^11.0.5",
    "@nestjs/platform-express": "^11.1.10",
    "@nestjs/schedule": "^6.1.0",
    "@nestjs/swagger": "^11.2.1",
    "@nestjs/throttler": "^6.4.0",
    "@prisma/client": "^7.3.0",
    "bcryptjs": "^2.4.3",
    "cache-manager": "^5.3.2",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "helmet": "^7.1.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.2"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.2.0",
    "@nestjs/schematics": "^10.0.1",
    "@nestjs/testing": "^11.0.1",
    "@types/bcryptjs": "^2.4.6",
    "@types/express": "^4.17.20",
    "@types/jest": "^29.5.8",
    "@types/node": "^20.9.0",
    "@types/passport-jwt": "^3.0.11",
    "@types/passport-local": "^1.0.38",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "eslint": "^8.52.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.3",
    "prisma": "^7.3.0",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2"
  }
}
```

---

## 📦 المرحلة 2: نقل الملفات من API

### الخطوة 2.1: المجلدات المطلوبة

```bash
# نسخ ملفات Auth من API
cp -r apps/api/src/domain/auth apps/auth/src/

# نسخ ملفات Users
cp -r apps/api/src/domain/users apps/auth/src/

# نسخ ملفات Email
cp -r apps/api/src/domain/email apps/auth/src/

# نسخ المجلدات المشتركة
cp -r apps/api/src/core apps/auth/src/

# نسخ Prisma migrations
cp -r apps/api/prisma/migrations apps/auth/prisma/
```

### الخطوة 2.2: إنشاء AppModule جديد

**ملف:** `apps/auth/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';

// Modules
import { AuthModule } from './domain/auth/auth.module';
import { UsersModule } from './domain/users/users.module';
import { EmailModule } from './domain/email/email.module';

// Common
import { AllExceptionsFilter } from './core/common/filters/all-exceptions.filter';
import { ThrottlerUserGuard } from './core/common/guards/throttler-user.guard';
import { DatabaseModule } from './core/database/database.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    DatabaseModule,

    // Cache & Throttling
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Feature Modules
    AuthModule,
    UsersModule,
    EmailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerUserGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
```

### الخطوة 2.3: إنشاء main.ts

**ملف:** `apps/auth/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const port = process.env.AUTH_SERVICE_PORT || 3001;

  // Security
  app.use(helmet());
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Performance
  app.use(compression());

  // CORS
  app.enableCors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  // Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Rukny Auth API')
      .setDescription('Authentication & Authorization Service')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  // Health Check
  app.get('/health', () => ({ status: 'ok' }));

  await app.listen(port, '0.0.0.0', () => {
    console.log(`🔐 Auth Service running on http://0.0.0.0:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start Auth Service:', error);
  process.exit(1);
});
```

---

## 🔄 المرحلة 3: تعديل API Service

### الخطوة 3.1: حذف Modules من API

```bash
# احذف هذه المجلدات من apps/api/src/domain:
# - auth
# - users
# - email
# - sessions (إن وجد)

rm -rf apps/api/src/domain/auth
rm -rf apps/api/src/domain/users
rm -rf apps/api/src/domain/email
```

### الخطوة 3.2: تحديث API AppModule

**ملف:** `apps/api/src/app.module.ts` - احذف الـ imports والـ modules:

```typescript
// احذف:
// - import { AuthModule } from './domain/auth/auth.module';
// - import { UsersModule } from './domain/users/users.module';
// - import { EmailModule } from './domain/email/email.module';

// وحافظ على:
// - ProductsModule
// - OrdersModule
// - EventsModule
// - StoresModule
// - etc...
```

### الخطوة 3.3: إنشاء JWT Guard جديد في API

**ملف:** `apps/api/src/core/common/guards/auth-service.guard.ts`

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtPayload } from 'packages/types';

@Injectable()
export class AuthServiceGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // استدعِ Auth Service للتحقق من الـ Token
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.AUTH_SERVICE_INTERNAL_URL}/auth/verify-token`,
          { token },
          {
            timeout: 5000,
          },
        ),
      );

      if (!response.data.valid) {
        throw new UnauthorizedException('Invalid token');
      }

      // أضف بيانات المستخدم إلى الـ Request
      request.user = response.data.user;
      request.token = response.data.payload;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer') return null;

    return token;
  }
}
```

### الخطوة 3.4: تحديث package.json للـ API

أزل التبعيات التي تتعلق بـ Auth:

```json
{
  "dependencies": {
    // احذف:
    // "@nestjs/jwt": "^11.0.1",
    // "@nestjs/passport": "^11.0.5",
    // "passport": "^0.7.0",
    // "passport-jwt": "^4.0.1",
    // "passport-local": "^1.0.0",
    
    // وأضف:
    "@nestjs/axios": "^1.0.1"
  }
}
```

---

## ✅ المرحلة 4: الاختبار

### الخطوة 4.1: تثبيت الاعتماديات

```bash
# Auth Service
cd apps/auth
npm install

# API Service
cd ../api
npm install
```

### الخطوة 4.2: تشغيل الخدمات

```bash
# في Terminal 1 - Auth Service
cd apps/auth
npm run start:dev

# في Terminal 2 - API Service
cd apps/api
npm run start:dev
```

### الخطوة 4.3: اختبار العمل

```bash
# 1. تسجيل حساب جديد
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@",
    "name": "Test User"
  }'

# 2. الحصول على Token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@"
  }'

# 3. استخدام Token في API
TOKEN="your_token_here"
curl -X GET http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚨 المشاكل الشائعة والحلول

### مشكلة: Auth module يتضارب مع API

**الحل:**
```bash
# احذف node_modules والـ package-lock.json
rm -rf apps/api/node_modules
rm apps/api/package-lock.json

# أعد التثبيت
npm install
```

### مشكلة: Prisma Client خطأ

**الحل:**
```bash
# في Auth Service
cd apps/auth
npx prisma generate

# في API Service
cd ../api
npx prisma generate
```

### مشكلة: قاعدة البيانات موجودة مسبقاً

**الحل:**
```bash
# حذف migrations الفارغة من auth
rm apps/auth/prisma/migrations/*/migration.sql

# مزامنة قاعدة البيانات
npx prisma db push
```

---

## 📊 قائمة التحقق النهائية

- [ ] مجلد `apps/auth` موجود وكامل
- [ ] `apps/auth/package.json` مُعدّل
- [ ] جميع الملفات المطلوبة مُنسوخة
- [ ] `apps/api` محدثة (بدون Auth modules)
- [ ] Prisma client يعمل في كلا الخدمتين
- [ ] Auth Service تبدأ بدون أخطاء
- [ ] API Service تبدأ بدون أخطاء
- [ ] اختبار Register/Login ناجح
- [ ] استدعاء API مع Token يعمل

---

## 🎯 الخطوات التالية

بعد اكتمال هذه الخطوات:

1. ✅ اختبر الخدمتين في البيئة المحلية
2. ⏳ اختبر Docker Compose
3. ⏳ أضف Health Check endpoints
4. ⏳ اختبر CI/CD
5. ⏳ نشر على Railway

