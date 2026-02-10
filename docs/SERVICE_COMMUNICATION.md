# 🔗 Service Communication Protocol

## توثيق البروتوكول والتواصل بين Auth و API Services

---

## 1️⃣ Client → Auth Service (تسجيل الدخول)

### Endpoint: POST `/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

### Endpoint: POST `/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response (201):**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { ... }
}
```

---

### Endpoint: POST `/auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2️⃣ Client → API Service (البيانات)

جميع الـ Requests تحتوي على `Authorization` header:

```bash
GET https://dev.rukny.io/api/v1/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3️⃣ API Service → Auth Service (التحقق)

### Internal: POST `/auth/verify-token`

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER"
  },
  "payload": {
    "iat": 1704067200,
    "exp": 1704153600
  }
}
```

**Response (401):**
```json
{
  "valid": false,
  "message": "Token expired or invalid"
}
```

---

## 🛡️ JWT Token Structure

### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER",
  "iat": 1704067200,
  "exp": 1704153600,
  "type": "access"
}
```

### Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "jwt-secret-key"
)
```

---

## 🔐 JWT Secret Management

### الملف: `packages/types/jwt.ts`

```typescript
export interface JwtPayload {
  sub: string;         // User ID
  email: string;
  name: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat: number;         // Issued At
  exp: number;         // Expiration
}

export const JWT_CONFIG = {
  // Auth Service يصدر الـ Tokens
  ACCESS_TOKEN_EXPIRATION: '7d',    // 7 أيام
  REFRESH_TOKEN_EXPIRATION: '30d',  // 30 يوم
  
  // API Service يتحقق منها
  VERIFICATION_ENDPOINT: '/auth/verify-token',
  CACHE_DURATION: 300,  // ثواني - cache verification for 5 mins
};
```

---

## 🔄 Token Refresh Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. Login مع credentials
       │
       ▼
┌──────────────┐
│ Auth Service │ ──► يصدر accessToken (7d) و refreshToken (30d)
└──────┬───────┘
       │ 2. يخزن tokens في client
       │
       ▼
┌──────────────┐
│ API Service  │ ◄── API request مع accessToken
└──────┬───────┘
       │ 3. يتحقق من Token
       │
       ├─► Token صالح → إكمال الـ Request ✓
       │
       └─► Token مُنتهي → 401 Unauthorized
            │
            ▼
       ┌──────────────┐
       │ Auth Service │ ◄── POST /auth/refresh مع refreshToken
       │ (جديد)       │
       └──────┬───────┘
              │ يصدر accessToken جديد
              │
              ▼
            Client يعاود المحاولة مع accessToken الجديد
```

---

## 💾 Token Storage Strategy

### Client-side (Next.js)

```typescript
// localstorage: أفضل للـ Web Server انطلاقاً من CSR
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);

// أو httpOnly Cookie: أفضل للأمان مع SSR/API routes
// يتم تعيينه من Auth Service مع flag httpOnly + Secure + SameSite
```

### API Guard Implementation

```typescript
// apps/api/src/common/guards/jwt.guard.ts

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authClient: AuthClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('No token provided');

    try {
      // التحقق من الـ Token من Auth Service
      const verification = await this.authClient.verifyToken(token);
      
      if (!verification.valid) {
        throw new UnauthorizedException('Invalid token');
      }

      // إرفاق بيانات المستخدم بـ Request
      request.user = verification.user;
      request.token = verification.payload;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
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

---

## 📡 Service Integration Module

### الملف: `packages/types/service-client.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

export interface ServiceConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface VerificationResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  payload?: any;
  message?: string;
}

export class AuthServiceClient {
  private client: AxiosInstance;
  private cache?: Map<string, { data: any; timestamp: number }>;

  constructor(config: ServiceConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 5000,
    });

    if (config.cache) {
      this.cache = new Map();
    }
  }

  async verifyToken(token: string): Promise<VerificationResponse> {
    // Check cache first
    if (this.cache?.has(token)) {
      const cached = this.cache.get(token);
      if (Date.now() - cached.timestamp < 300000) { // 5 min cache
        return cached.data;
      }
    }

    try {
      const response = await this.client.post<VerificationResponse>(
        '/auth/verify-token',
        { token }
      );

      // Cache the result
      if (this.cache) {
        this.cache.set(token, {
          data: response.data,
          timestamp: Date.now(),
        });
      }

      return response.data;
    } catch (error) {
      return { valid: false, message: 'Verification failed' };
    }
  }

  async getUser(userId: string) {
    return this.client.get(`/auth/users/${userId}`);
  }

  async logout(token: string) {
    if (this.cache?.has(token)) {
      this.cache.delete(token);
    }
    return this.client.post('/auth/logout', { token });
  }
}
```

---

## 🐳 Docker Network Communication

عندما تعمل الخدمات في Docker، يستخدم Docker DNS:

```bash
# داخل Docker Network
http://auth:3001      # Auth Service
http://api:3000       # API Service
http://postgres:5432  # Database
http://redis:6379     # Redis
```

---

## 🌐 Production Domain Mapping

```
Client URL              Internal Service       Service Port
─────────────────────────────────────────────────────────
rukny.io                (Next.js Web)          3002
auth.rukny.io           auth service           3001
dev.rukny.io            api service            3000
```

### Nginx Configuration (اختياري للـ Reverse Proxy)

```nginx
# للـ Auth Service
upstream auth_service {
  server auth:3001;
}

server {
  server_name auth.rukny.io;
  
  location / {
    proxy_pass http://auth_service;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# للـ API Service
upstream api_service {
  server api:3000;
}

server {
  server_name dev.rukny.io;
  
  location /api/ {
    proxy_pass http://api_service;
    proxy_set_header Authorization $http_authorization;
  }
}
```

---

## ✅ Testing Checklist

### 1. Auth Service
```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@"
  }'

# Refresh Token
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "..."}'
```

### 2. API Service
```bash
# مع Access Token
curl -X GET http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# بدون Token - يجب أن ترجع 401
curl -X GET http://localhost:3000/api/v1/products
```

### 3. Service-to-Service
```bash
# من داخل Docker
docker exec rukny_api curl http://auth:3001/auth/verify-token \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"token": "..."}'
```

---

## 🚨 Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Continue |
| 201 | Created | Return resource |
| 400 | Bad Request | Fix request |
| 401 | Unauthorized | Refresh or re-login |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Check endpoint |
| 429 | Too Many Requests | Throttle requests |
| 500 | Server Error | Retry with backoff |

### Retry Logic

```typescript
async function requestWithRetry(
  fn: () => Promise<any>,
  maxRetries = 3,
  backoff = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = backoff * Math.pow(2, i);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

---

## 📊 Monitoring & Logging

```typescript
// Log Token Verification
logger.info('Token verified', {
  userId: user.id,
  endpoint: req.path,
  timestamp: new Date(),
});

// Log Failed Attempts
logger.warn('Token verification failed', {
  reason: error.message,
  ip: req.ip,
  timestamp: new Date(),
});
```

