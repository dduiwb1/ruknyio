# 🚂 Railway Deployment Guide

## Overview
This guide covers deploying your Rukny.io monorepo to Railway without using Dockerfiles. Railway will use Nixpacks to automatically detect and build your NestJS API and Next.js frontend.

## Prerequisites
- Railway account (https://railway.app)
- Git repository connected to Railway
- PostgreSQL database (recommended: Railway's PostgreSQL service or existing Neon database)
- Redis instance (recommended: Railway's Redis service)

## Project Structure
Your project is a monorepo with:
- `apps/api` - NestJS backend
- `apps/web` - Next.js frontend
- `packages/*` - Shared packages

## Deployment Steps

### 1. Create Railway Project
1. Go to https://railway.app
2. Create a new project
3. Connect your GitHub repository

### 2. Deploy Backend (API)

#### Create API Service
1. Click "New Service" → "GitHub Repo"
2. Select your repository
3. Configure the service:
   - **Service Name**: `api`
   - **Root Directory**: `apps/api`
   - **Build Command**: (Automatically detected from railway.toml)
   - **Start Command**: (Automatically detected from railway.toml)

#### Set Environment Variables for API
Add these environment variables in Railway dashboard:

**Required Variables:**
```bash
# Database (Use Railway PostgreSQL or your Neon database)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Security & Authentication (Generate secure keys!)
JWT_SECRET=<generate-with: openssl rand -hex 32>
TWO_FACTOR_ENCRYPTION_KEY=<generate-with: openssl rand -hex 32>
INTERNAL_API_SECRET=<generate-with: openssl rand -hex 32>

# Application
NODE_ENV=production
PORT=${{PORT}}
FRONTEND_URL=${{WEB.url}}

# Cookie Configuration
COOKIE_DOMAIN=<your-api-domain>
COOKIE_SECURE=true

# Redis (Use Railway Redis service)
REDIS_URL=${{REDIS.REDIS_URL}}
REDIS_HOST=${{REDIS.REDIS_HOST}}
REDIS_PORT=${{REDIS.REDIS_PORT}}

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_REGION=eu-north-1
S3_BUCKET=rukny-storage

# Email (Resend)
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=notifications@rukny.work

# OAuth (Optional - Update callback URLs to your Railway domain)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://<your-api-domain>/api/v1/auth/google/callback

LINKEDIN_CLIENT_ID=<your-linkedin-client-id>
LINKEDIN_CLIENT_SECRET=<your-linkedin-client-secret>
LINKEDIN_CALLBACK_URL=https://<your-api-domain>/api/v1/auth/linkedin/callback

# Account Lockout
LOCKOUT_MAX_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
LOCKOUT_MAX_DURATION_MINUTES=1440
LOCKOUT_WINDOW_MINUTES=30
LOCKOUT_PROGRESSIVE_MULTIPLIER=2

# WhatsApp (Optional)
WHATSAPP_API_URL=<your-whatsapp-api-url>
WHATSAPP_SESSION_ID=<your-session-id>
WHATSAPP_ACCESS_TOKEN=<your-access-token>
```

### 3. Deploy Frontend (Web)

#### Create Web Service
1. Click "New Service" → "GitHub Repo"
2. Select your repository
3. Configure the service:
   - **Service Name**: `web`
   - **Root Directory**: `apps/web`
   - **Build Command**: (Automatically detected from railway.toml)
   - **Start Command**: (Automatically detected from railway.toml)

#### Set Environment Variables for Web
Add these environment variables in Railway dashboard:

```bash
# API Configuration (Use Railway's internal service URL)
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

# Debug (Optional)
NEXT_PUBLIC_DEBUG=false
```

### 4. Add PostgreSQL Database (Optional - if not using Neon)
1. Click "New Service" → "Database" → "PostgreSQL"
2. Railway will automatically create `DATABASE_URL` variable
3. Reference it in your API service: `${{POSTGRES.DATABASE_URL}}`

### 5. Add Redis Cache
1. Click "New Service" → "Database" → "Redis"
2. Railway will automatically create Redis connection variables
3. Reference them in your API service:
   - `REDIS_URL=${{REDIS.REDIS_URL}}`
   - `REDIS_HOST=${{REDIS.REDIS_HOST}}`
   - `REDIS_PORT=${{REDIS.REDIS_PORT}}`

## Railway Configuration Files

### API Configuration (`apps/api/railway.toml`)
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run deploy"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[deploy.healthcheck]
path = "/health"
timeout = 100
interval = 30
```

### Web Configuration (`apps/web/railway.toml`)
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

## Important Notes

### 1. OAuth Callback URLs
Update your OAuth provider callback URLs to match your Railway domains:
- Google: `https://your-api-domain.railway.app/api/v1/auth/google/callback`
- LinkedIn: `https://your-api-domain.railway.app/api/v1/auth/linkedin/callback`

### 2. CORS Configuration
Ensure your API allows your frontend domain in CORS settings. Update the `FRONTEND_URL` environment variable.

### 3. Database Migrations
The API service runs `prisma migrate deploy` automatically on startup (via the `npm run deploy` command).

### 4. Custom Domains
To use custom domains:
1. Go to service settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as shown
5. Update environment variables with your custom domain

### 5. Monorepo Considerations
Railway automatically handles the monorepo structure by using the `Root Directory` setting. Each service is independent but shares the same repository.

### 6. Build Optimization
- Railway caches dependencies between builds
- The Nixpacks builder automatically detects Node.js and installs dependencies
- Build times: ~2-5 minutes for initial deployment, ~1-2 minutes for subsequent deployments

## Deployment Workflow

### Initial Deployment
1. Push code to GitHub
2. Railway automatically detects changes and triggers builds
3. Wait for both services to build and deploy
4. Check logs for any errors
5. Test your application

### Subsequent Deployments
1. Push changes to GitHub
2. Railway automatically rebuilds affected services
3. Zero-downtime deployment

## Monitoring

### Health Checks
The API service has a health check endpoint at `/health` that Railway uses to monitor service health.

### Logs
View logs in Railway dashboard:
- Build logs: Check for compilation errors
- Deploy logs: Check for runtime errors
- Application logs: Your console.log output

### Metrics
Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Response times

## Troubleshooting

### Build Failures
1. Check build logs for errors
2. Verify all dependencies are in package.json
3. Ensure railway.toml syntax is correct
4. Check for TypeScript compilation errors

### Runtime Errors
1. Check deploy logs
2. Verify all environment variables are set
3. Check database connection
4. Verify Redis connection
5. Review CORS configuration

### Database Issues
1. Ensure DATABASE_URL is correctly set
2. Check if migrations ran successfully
3. Verify database credentials
4. Check connection string format

### Performance Issues
1. Scale service (increase RAM/CPU)
2. Enable Redis caching
3. Optimize database queries
4. Enable CDN for static assets

## Cost Optimization

### Free Tier
Railway offers $5/month in free credits-

### Recommendations
1. Start with Hobby plan ($5/month)
2. Use Railway's PostgreSQL and Redis (included)
3. Monitor usage in dashboard
4. Scale services as needed

## Security Checklist

- ✅ Use strong JWT_SECRET (32+ characters)
- ✅ Enable COOKIE_SECURE in production
- ✅ Use HTTPS for all services
- ✅ Keep dependencies updated
- ✅ Set proper CORS origins
- ✅ Use environment variables for secrets
- ✅ Enable rate limiting
- ✅ Review security headers

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Report bugs in your repository

---

**Last Updated**: February 17, 2026
**Tested Railway Version**: Latest (2026)
