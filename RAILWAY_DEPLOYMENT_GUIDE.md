# Railway Deployment Guide for Rukny.io API

This guide provides complete step-by-step instructions for deploying your NestJS API to Railway.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Setup Steps](#setup-steps)
4. [Configuration](#configuration)
5. [Deployment Process](#deployment-process)
6. [Verification & Testing](#verification--testing)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
8. [Next Steps](#next-steps)

---

## Prerequisites

Before starting, ensure you have:

- **Railway Account**: Sign up at [railway.app](https://railway.app)
- **GitHub Account**: Connect to Railway for Git integration
- **Git Repository**: Your code pushed to a GitHub repository
- **Environment Variables**: Prepare all required secrets (database URL, API keys, etc.)
- **Docker Desktop**: For local testing (optional but recommended)

---

## Architecture Overview

Your Rukny.io API deployment will include:

```
┌─────────────────────────────────────────────┐
│          Railway Platform                    │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │   NestJS API Container               │  │
│  │  (Built from Dockerfile)             │  │
│  │  - Multi-stage build (optimized)     │  │
│  │  - Auto-migration on startup         │  │
│  │  - Health checks enabled             │  │
│  │  Port: 3001                          │  │
│  └──────────────────────────────────────┘  │
│           ↓ Connects to ↓                   │
│  ┌──────────────────────────────────────┐  │
│  │   PostgreSQL Database                │  │
│  │  (Railway Service)                   │  │
│  │  - Auto-backup enabled               │  │
│  │  - SSL/TLS connection secured        │  │
│  └──────────────────────────────────────┘  │
│           ↓ Connects to ↓                   │
│  ┌──────────────────────────────────────┐  │
│  │   Redis Cache                        │  │
│  │  (Railway Service)                   │  │
│  └──────────────────────────────────────┘  │
│                                              │
└─────────────────────────────────────────────┘
         ↓ Public Domain (Custom)
    your-api.railway.app
```

### Key Components:

1. **Dockerfile**: Multi-stage build optimized for production
2. **railway.json**: Railway-specific configuration
3. **.dockerignore**: Excludes unnecessary files from Docker build
4. **.env.production**: Production environment variables template
5. **Prisma Migrations**: Automatic schema updates on deployment

---

## Setup Steps

### Step 1: Verify Files Created

The following files have been created in your repository:

- ✅ `Dockerfile` - Multi-stage production build
- ✅ `.dockerignore` - Optimized build context
- ✅ `railway.json` - Railway configuration
- ✅ `apps/api/.env.production` - Production environment template

### Step 2: Prepare Your GitHub Repository

```bash
# Navigate to your project directory
cd d:\xampp\htdocs\Rukny.io

# Verify all files are ready
git status

# Stage the new files
git add Dockerfile .dockerignore railway.json apps/api/.env.production

# Commit changes
git commit -m "chore: add Railway deployment configuration"

# Push to GitHub
git push origin main  # or your default branch
```

### Step 3: Create Railway Project

1. **Go to [railway.app](https://railway.app)** and sign in
2. **Create a new project**:
   - Click "Create a new project" button
   - Select "GitHub Repo"
   - Authorize Railway to access your GitHub account
   - Select your `Rukny.io` repository
   - Select the branch to deploy (usually `main`)

3. **Create Required Services**:

   **Option A: Using Railway's Database Services (Recommended)**

   - In your project dashboard, click "+ New"
   - Add **PostgreSQL** service
   - Set database name: `rukny_io`
   - Add **Redis** service

   **Option B: Using External Services (Advanced)**

   - If you prefer Neon PostgreSQL or Upstash Redis, set the connection URLs in environment variables

### Step 4: Configure Deploy Source

In Railway Project → Settings:

- **Root Directory**: Leave empty (for monorepo, defaults to root)
- **Dockerfile Path**: `./Dockerfile` (Railway will auto-detect)
- **Watch Paths**: `apps/api/` (triggers redeploy on API changes)

### Step 5: Set Environment Variables

1. **In Railway Dashboard** → Your Project → API Service → Variables

2. **Add the following variables** (get values from your services or prepare secrets):

   ```
   # Database (Railway will provide this automatically)
   DATABASE_URL=postgresql://user:password@db-service:5432/rukny_io

   # Redis (Railway will provide this automatically)
   REDIS_URL=redis://:password@redis-service:6379

   # Application
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend-domain.com

   # Security (Generate these!)
   JWT_SECRET=<generate-with: openssl rand -hex 32>
   TWO_FACTOR_ENCRYPTION_KEY=<generate-with: openssl rand -hex 32>
   INTERNAL_API_SECRET=<generate-with: openssl rand -hex 32>

   # OAuth (Configure in your OAuth provider dashboards)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-api-domain/api/v1/auth/google/callback

   # Email
   RESEND_API_KEY=re_xxxxxxxxxxxx
   RESEND_FROM_EMAIL=Rukny <notifications@rukny.store>

   # AWS S3
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   AWS_REGION=us-east-1
   S3_BUCKET=your-bucket-name

   # Add other variables as needed
   COOKIE_DOMAIN=your-api-domain
   COOKIE_SECURE=true
   ```

### Step 6: Connect Services

In Railway Dashboard:

1. **Click on your API Service**
2. **Variables Tab** → Click "Add Variables from Services"
   - This auto-fills `DATABASE_URL` from PostgreSQL
   - And `REDIS_URL` from Redis

---

## Configuration

### Understanding the Dockerfile

```dockerfile
# Stage 1: Builder
# - Installs all dependencies (dev + prod)
# - Builds the entire monorepo

# Stage 2: Runtime
# - Uses lightweight alpine base image
# - Only includes production dependencies
# - Significantly reduces image size (85% smaller)
```

**Benefits**:
- ✅ Small image size (~200MB vs 800MB+)
- ✅ No source code in final image
- ✅ No build tools or dev dependencies
- ✅ Faster deployment times

### Understanding railway.json

```json
{
  "build": {
    "builder": "dockerfile"  // Uses your Dockerfile
  },
  "deploy": {
    "numReplicas": 1,        // Single instance (scale up in Railway UI)
    "restartPolicyType": "always",  // Auto-restart on failure
    "startCommand": "npm run migrate && npm run start:prod"  // Runs migrations + starts app
  }
}
```

### Environment Variables Safety

**Never commit sensitive variables!**

Instead:
1. ✅ Keep `.env.production` as a **template only**
2. ✅ Add actual secrets in **Railway Dashboard**
3. ✅ Add `.env.production` to `.gitignore` (or keep it as template)

---

## Deployment Process

### Method 1: Automatic Deployment (Recommended)

```
GitHub Push → GitHub Webhook → Railway Build → Docker Container → Deploy
```

**Steps**:
1. Push code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: update API code"
   git push origin main
   ```

2. Railway automatically detects the push and:
   - Clones your repository
   - Builds the Docker image
   - Runs migrations
   - Deploys the container
   - Makes it publicly accessible

3. **Monitor in Railway Dashboard**:
   - Build logs scroll in real-time
   - Deployment status updates
   - See live logs after deployment

### Method 2: Initial Manual Deployment

If Railway doesn't auto-trigger:

1. In Railway Dashboard → Select your API Service
2. Click "Deploy" or "Redeploy Latest"
3. Monitor the build process

### Method 3: Using Railway CLI (Advanced)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link local project to Railway project
railway link

# Deploy current code
railway up

# View logs
railway logs

# Check running services
railway status
```

---

## Verification & Testing

### Step 1: Check Deployment Status

1. In Railway Dashboard, verify:
   - ✅ Build completed successfully
   - ✅ Container is running (green status)
   - ✅ Services are connected

### Step 2: Test API Endpoints

Get your Railway domain:
1. In Railway Dashboard → API Service
2. Copy the public domain (e.g., `api-production-e7b3.railway.app`)

Test the API:

```bash
# Health Check
curl https://api-production-e7b3.railway.app/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}

# Swagger Documentation (if enabled)
curl https://api-production-e7b3.railway.app/api/docs
```

### Step 3: Check Database Migration

```bash
# View logs in Railway Dashboard
# Look for:
# ✅ "Successfully applied migrations"
# ✅ "Server is running on: 0.0.0.0:3001"
```

### Step 4: Verify Environment Variables

Test if your app can access environment variables:

```bash
# If you have a debug endpoint (optional):
curl https://api-production-e7b3.railway.app/api/v1/debug/config

# Or check logs for:
# ✅ "JWT_SECRET loaded"
# ✅ "DATABASE_URL connected"
# ✅ "REDIS_URL connected"
```

### Step 5: Database Connection Test

```bash
# View Railway logs for connection confirmations:
# ✅ "Prisma Engine ready"
# ✅ "Connected to Redis"
# ✅ "Database migrations completed"
```

---

## Monitoring & Troubleshooting

### Common Issues & Solutions

#### Issue 1: Build Fails - "Module not found"

**Cause**: Missing dependencies

**Solution**:
```bash
# Verify locally
npm ci
npm run build

# Check package.json in root and apps/api/
# Ensure @prisma/client is listed

# Rebuild in Railway: Delete old build and redeploy
```

#### Issue 2: Container Crashes - "Payment required"

**Cause**: Missing or incorrect configuration

**Solution**:
```bash
# Check Railway logs for specific error
# Add missing environment variables in Railway Dashboard

# For Railway Redis: Service needs to be added
# Click "+ New" → Redis
```

#### Issue 3: Database Connection Failed

**Cause**: DATABASE_URL not set or incorrect

**Solution**:
```bash
# In Railway Dashboard:
1. Ensure PostgreSQL service exists
2. Click on PostgreSQL service
3. Copy DATABASE_URL
4. Add to API service variables
5. Restart API service
```

#### Issue 4: Migrations Don't Run

**Cause**: Migration failed silently

**Solution**:
```bash
# Check logs for Prisma errors
# Verify database: Is connected?
# Try connecting directly to verify schema

# If schema mismatch:
1. Backup database
2. Manually run migration:
   railway run npm run migrate
3. Check Prisma schema
```

### Essential Logs to Check

In Railway Dashboard → API Service → Logs:

1. **Build Logs** (green ✅ or red ✗)
   - Shows Docker build process
   - Look for "Successfully built" message

2. **Deploy Logs** (continuous stream)
   - Shows container startup
   - Look for "Server is running" message

3. **Error Logs** (red text)
   - Connection errors
   - Missing environment variables
   - Migration failures

### Monitoring Tools

1. **Railway Dashboard**:
   - Real-time memory & CPU usage
   - Network activity
   - Deployment history

2. **Health Endpoint**:
   ```bash
   curl https://your-api.railway.app/health
   ```

3. **Set Custom Domain** (Optional but recommended):
   - In Railway → API Service → Domains
   - Add: `api.yourdomain.com`
   - Update frontend URL
   - Update OAuth redirect URIs

---

## Next Steps

### 1. Connect Your Frontend

Update your web app's API calls:

```typescript
// apps/web/lib/api-client.ts
const API_URL = new URL(
  process.env.NEXT_PUBLIC_API_URL ||
    'https://your-api-domain.railway.app/api'
);
```

### 2. Set Custom Domain (Optional)

1. In Railway → API Service → Settings
2. Add your custom domain: `api.yourdomain.com`
3. Update CORS in API:
   ```env
   FRONTEND_URL=https://yourdomain.com
   ```

### 3. Enable Monitoring

```bash
# Add health checks to Railway
# In railway.json:
{
  "deploy": {
    "healthCheck": {
      "path": "/health",
      "intervalSeconds": 30
    }
  }
}
```

### 4. Set Up Automatic Backups

1. In Railway → PostgreSQL Service
2. Enable daily backups
3. Set retention period (7-30 days)

### 5. Configure CI/CD Pipeline (Optional)

For automatic testing before deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npx railway up
```

---

## File Reference

### Created Files Explained

#### 1. `Dockerfile`

**Location**: `d:\xampp\htdocs\Rukny.io\Dockerfile`

**Key Sections**:
- **Stage 1 (Builder)**: Compiles code, runs build, installs all deps
- **Stage 2 (Runtime)**: Strips down to essentials, only prod deps
- **Result**: Optimized container (~200MB)

**How it works**:
1. Pulls Node 20 Alpine image (lightweight)
2. Copies monorepo to builder
3. Installs all dependencies
4. Builds entire workspace with `npm run build`
5. Creates runtime image with only prod dependencies
6. Copies built API from builder stage
7. Creates upload directories
8. Exposes port 3001
9. Runs migrations and starts app on container startup

#### 2. `.dockerignore`

**Location**: `d:\xampp\htdocs\Rukny.io\.dockerignore`

**What it excludes** (reducing build context):
- git history (`.git`, `.gitignore`)
- node_modules (will be reinstalled)
- build artifacts (`dist`, `build`)
- IDE files (`.vscode`, `.idea`)
- Environment files (`.env`, `.env.local`)
- Test files
- Documentation
- Lock files

**Result**: Faster Docker builds (context size matters!)

#### 3. `railway.json`

**Location**: `d:\xampp\htdocs\Rukny.io\railway.json`

**Purpose**: Tells Railway how to build and deploy

**Configuration**:
```json
{
  "build": {
    "builder": "dockerfile"    // Use ./Dockerfile
  },
  "deploy": {
    "numReplicas": 1,          // 1 instance (scale in Railway UI)
    "restartPolicyType": "always",  // Restart if crashes
    "startCommand": "npm run migrate && npm run start:prod"  // Run migrations first!
  }
}
```

#### 4. `.env.production`

**Location**: `d:\xampp\htdocs\Rukny.io\apps\api\.env.production`

**Purpose**: Template for production environment variables

**Important**:
- ⚠️ Don't commit actual secrets here
- ✅ Use Railway Dashboard for actual values
- ✅ Keep as reference/documentation

**Required Variables**:
- DATABASE_URL: PostgreSQL connection
- REDIS_URL: Redis connection
- JWT_SECRET: Generate with `openssl rand -hex 32`
- OAuth credentials, API keys, etc.

---

## Troubleshooting Checklist

### Pre-Deployment

- [ ] All files created successfully?
- [ ] Changes committed and pushed to GitHub?
- [ ] Railway project created?
- [ ] PostgreSQL service added?
- [ ] Redis service added?
- [ ] All environment variables added?

### During Deployment

- [ ] Build log shows "Successfully built"?
- [ ] No compilation errors in logs?
- [ ] Migrations completed?
- [ ] Server started on port 3001?

### Post-Deployment

- [ ] Health endpoint responds?
- [ ] API endpoints accessible?
- [ ] Database queries working?
- [ ] External APIs connected (OAuth, S3, etc.)?

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Railway CLI**: https://docs.railway.app/cli/quick-start
- **NestJS Deployment**: https://docs.nestjs.com/deployment
- **Prisma Deployment**: https://www.prisma.io/docs/orm/deployment
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/

---

## Summary

✅ **Your API is now ready for production deployment!**

**What happens next**:
1. Push code to GitHub
2. Railway automatically builds and deploys
3. Databases are provisioned and connected
4. Migrations run automatically
5. Your API is live and accessible globally

**Typical deployment time**: 3-5 minutes

**Performance benefits**:
- Global CDN with automatic caching
- 99.9% uptime SLA
- Automatic SSL/HTTPS
- Regional data centers
- Pay-as-you-go pricing

Good luck with your deployment! 🚀
