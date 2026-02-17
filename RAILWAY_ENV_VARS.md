# Railway Environment Variables - Quick Reference

## API Service Environment Variables

### ⚠️ CRITICAL - Must Set Before Deployment

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_FnMuxN85jcdC@ep-icy-hat-aifcaofu.c-4.us-east-1.aws.neon.tech/neondb?sslmode=verify-full
DIRECT_URL=postgresql://neondb_owner:npg_FnMuxN85jcdC@ep-icy-hat-aifcaofu.c-4.us-east-1.aws.neon.tech/neondb?sslmode=verify-full

# Security (MUST GENERATE NEW KEYS FOR PRODUCTION!)
JWT_SECRET=47ef4834efc6e98bc69769e4e3340a7cc1fb45b936d305341ef21387566f3b0a
TWO_FACTOR_ENCRYPTION_KEY=1036f96689ee891c546438151e0e8faaaab2175b9f7b6b96c671f167d9e3b06b
INTERNAL_API_SECRET=d72129ca73d607f83a1e51529c4eb387240c4cc146ab73354f3bfb55fafeba9b

# Application
NODE_ENV=production
PORT=${{PORT}}
FRONTEND_URL=${{WEB.url}}

# Cookie
COOKIE_DOMAIN=
COOKIE_SECURE=true

# Redis (Use Railway Redis Service)
REDIS_URL=${{REDIS.REDIS_URL}}
REDIS_HOST=${{REDIS.REDIS_HOST}}
REDIS_PORT=${{REDIS.REDIS_PORT}}
REDIS_PASSWORD=
REDIS_DB=0

# AWS S3
AWS_ACCESS_KEY_ID=AKIARJ7RMAPCIJWRIVF5
AWS_SECRET_ACCESS_KEY=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
AWS_REGION=eu-north-1
S3_BUCKET=rukny-storage

# Email
RESEND_API_KEY=re_GVhK6G8G_Mf5yNdKQRquqxmP2YjRLiA6c
RESEND_FROM_EMAIL=notifications@rukny.work

# Account Lockout
LOCKOUT_MAX_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
LOCKOUT_MAX_DURATION_MINUTES=1440
LOCKOUT_WINDOW_MINUTES=30
LOCKOUT_PROGRESSIVE_MULTIPLIER=2
```

### 📝 Optional - OAuth (Update Callback URLs!)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=1051680542097-rivqtfniekp7epucuc7v5dpm13ph3u3f.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://<YOUR-API-DOMAIN>/api/v1/auth/google/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=77b3o2w9dmp95f
LINKEDIN_CLIENT_SECRET=WPL_AP1.LMmQsEpKl4pxm7uv.bKohYA==
LINKEDIN_CALLBACK_URL=https://<YOUR-API-DOMAIN>/api/v1/auth/linkedin/callback
LINKEDIN_SCOPES=openid,profile,email

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=1051680542097-rivqtfniekp7epucuc7v5dpm13ph3u3f.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=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
GOOGLE_CALENDAR_REDIRECT_URI=https://<YOUR-API-DOMAIN>/api/v1/google/calendar/callback

# Google Sheets
GOOGLE_SHEETS_REDIRECT_URI=https://<YOUR-API-DOMAIN>/api/v1/integrations/google-sheets/callback
```

### 📱 Optional - WhatsApp

```bash
WHATSAPP_API_URL=https://message.dashboard.technoplus.tech
WHATSAPP_SESSION_ID=ecca59d5-076d-415b-a49a-0269d68c47c7
WHATSAPP_ACCESS_TOKEN=167|niQOUgx0uEZoRTTWu1wtqvipkB86uvd3Hteymlbz769c3565
```

---

## WEB Service Environment Variables

### ⚠️ CRITICAL - Must Set Before Deployment

```bash
# API Configuration
API_BACKEND_URL=https://${{API.RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_API_EXTERNAL_URL=https://${{API.RAILWAY_PUBLIC_DOMAIN}}/api/v1

# App Configuration
NEXT_PUBLIC_APP_URL=https://${{WEB.RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_APP_NAME=Rukny

# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Auth Cookie Names
NEXT_PUBLIC_AUTH_COOKIE_NAME=rukny_auth
NEXT_PUBLIC_REFRESH_COOKIE_NAME=rukny_refresh

# Debug
NEXT_PUBLIC_DEBUG=false
```

---

## How to Add Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on the service (API or Web)
3. Go to "Variables" tab
4. Click "New Variable"
5. Add variable name and value
6. Click "Add" or "Deploy" to apply changes

## Using Railway Service References

Railway allows you to reference other services' URLs using the syntax:
```
${{SERVICE_NAME.VARIABLE}}
```

Examples:
- `${{API.RAILWAY_PUBLIC_DOMAIN}}` - API service's public domain
- `${{REDIS.REDIS_URL}}` - Redis service's connection URL
- `${{POSTGRES.DATABASE_URL}}` - PostgreSQL database URL

## Security Notes

⚠️ **IMPORTANT**: The keys shown above are from your development .env file. For production:

1. **Generate new JWT_SECRET**:
   ```bash
   openssl rand -hex 32
   ```

2. **Generate new TWO_FACTOR_ENCRYPTION_KEY**:
   ```bash
   openssl rand -hex 32
   ```

3. **Generate new INTERNAL_API_SECRET**:
   ```bash
   openssl rand -hex 32
   ```

4. **Never commit production keys to Git!**

5. **Rotate keys regularly** (every 3-6 months)

6. **Update OAuth callback URLs** to match your Railway domains

---

## Verification Steps

After setting environment variables:

1. ✅ Check API service logs for successful startup
2. ✅ Visit API health endpoint: `https://<api-domain>/health`
3. ✅ Check Web service logs for successful build
4. ✅ Visit Web app: `https://<web-domain>`
5. ✅ Test authentication flow
6. ✅ Verify database connection (check Prisma logs)
7. ✅ Verify Redis connection (check cache logs)

---

**Last Updated**: February 17, 2026
