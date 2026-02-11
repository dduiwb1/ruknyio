# Railway Deployment Configuration Checklist

## Pre-Deployment Verification (Phase 1)

### Local Setup ✓

- [ ] **Verify Dockerfile exists and is correct**
  - Location: `./Dockerfile`
  - Check: Multi-stage build for optimized production image
  - Command: `head -20 Dockerfile`

- [ ] **Verify .dockerignore exists**
  - Location: `./.dockerignore`
  - Contains exclusions for: node_modules, .git, dist, test, etc.
  - Command: `cat .dockerignore | head -20`

- [ ] **Verify railway.json exists**
  - Location: `./railway.json`
  - Contains: builder, deploy config
  - Command: `cat railway.json`

- [ ] **Verify .env.production template exists**
  - Location: `./apps/api/.env.production`
  - Contains all variable placeholders
  - Command: `head -30 apps/api/.env.production`

- [ ] **Verify deployment guide exists**
  - Location: `./RAILWAY_DEPLOYMENT_GUIDE.md`
  - Full documentation for deployment steps

### Git Repository ✓

- [ ] All files committed to git
  ```bash
  git add Dockerfile .dockerignore railway.json apps/api/.env.production RAILWAY_DEPLOYMENT_GUIDE.md
  git commit -m "chore: add Railway deployment configuration"
  ```

- [ ] Changes pushed to GitHub
  ```bash
  git push origin main  # or your default branch
  ```

- [ ] GitHub repository is public (for Railway to access)
  - Settings → General → Make repository public (if private)

### Prepare Environment Variables ✓

Generate secure secret keys:

```bash
# JWT_SECRET (copy the output)
openssl rand -hex 32
# Output: e.g., a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0

# TWO_FACTOR_ENCRYPTION_KEY
openssl rand -hex 32
# Output: f1e2d3c4b5a69798a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3

# INTERNAL_API_SECRET
openssl rand -hex 32
# Output: d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9

# RECAPTCHA_SECRET_KEY (get from Google reCAPTCHA Admin Console)

# Store these securely - you'll need them in Railway Dashboard
```

Prepare the following information:

- [ ] **Database**
  - [ ] Railway PostgreSQL will be auto-created, or use Neon PostgreSQL URL
  
- [ ] **Redis**
  - [ ] Railway Redis will be auto-created, or use Upstash Redis URL

- [ ] **Security Keys** (generated above)
  - [ ] `JWT_SECRET` (64 hex characters)
  - [ ] `TWO_FACTOR_ENCRYPTION_KEY` (64 hex characters)
  - [ ] `INTERNAL_API_SECRET` (64 hex characters)

- [ ] **OAuth Credentials**
  - [ ] Google OAuth Client ID & Secret
  - [ ] LinkedIn OAuth Client ID & Secret
  - [ ] Google Calendar API credentials (optional)

- [ ] **AWS S3**
  - [ ] AWS Access Key ID
  - [ ] AWS Secret Access Key
  - [ ] S3 Bucket name
  - [ ] AWS Region (e.g., us-east-1)

- [ ] **Email Service**
  - [ ] Resend API Key (from https://resend.com)
  - [ ] From email address

- [ ] **Domain Name** (for production)
  - [ ] Primary API domain (e.g., api.yourdomain.com)
  - [ ] Frontend domain for CORS

---

## Railway Setup (Phase 2)

### Create Railway Project ✓

- [ ] Sign up/Login to [railway.app](https://railway.app)

- [ ] Create new project
  - Click "Create Project"
  - Select "GitHub Repo"
  - Authorize Railway access to GitHub
  - Select your repository: `Rukny.io`
  - Select branch: `main` (or your default branch)

- [ ] Railway will show project creation status
  - Wait for it to complete
  - You'll see the project dashboard

### Add Database Services ✓

**Option 1: Railway's Services (Easiest)**

- [ ] Click "+ New" in your project
- [ ] Select "PostgreSQL"
  - Database name: `rukny_io`
  - Railway auto-creates, configure, and provide connection string
  
- [ ] Click "+ New" again
- [ ] Select "Redis"
  - Railway auto-creates and provides connection URL

**Option 2: External Services (Advanced)**

- [ ] Neon PostgreSQL
  - Create project at https://neon.tech
  - Get connection string with `?sslmode=require`
  
- [ ] Upstash Redis
  - Create project at https://upstash.com
  - Get Redis URL with authentication

### Configure API Service ✓

- [ ] In Railway Dashboard → Your Project
- [ ] You should see your API service (from GitHub)
  - If not, click "+ New" → Docker
  - Select your GitHub repository

- [ ] Select the API Service
- [ ] Go to Settings tab
  - Root Directory: (leave empty for monorepo)
  - Dockerfile Path: `./Dockerfile`
  - Watch Paths: `apps/api/` (optional, for faster redeploys)

### Set Environment Variables ✓

- [ ] Click on API Service
- [ ] Go to Variables tab

- [ ] Click "Add Variables from Services" (if PostgreSQL & Redis added)
  - This auto-assigns: `DATABASE_URL`, `REDIS_URL`

- [ ] Verify or add the following variables:

```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
COOKIE_DOMAIN=your-api-domain.com
COOKIE_SECURE=true

JWT_SECRET=<paste-generated-value>
TWO_FACTOR_ENCRYPTION_KEY=<paste-generated-value>
INTERNAL_API_SECRET=<paste-generated-value>

GOOGLE_CLIENT_ID=<your-value>
GOOGLE_CLIENT_SECRET=<your-value>
GOOGLE_CALLBACK_URL=https://your-api-domain/api/v1/auth/google/callback

LINKEDIN_CLIENT_ID=<your-value>
LINKEDIN_CLIENT_SECRET=<your-value>
LINKEDIN_CALLBACK_URL=https://your-api-domain/api/v1/auth/linkedin/callback

RESEND_API_KEY=re_<your-api-key>
RESEND_FROM_EMAIL=Rukny <notifications@rukny.store>

AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_REGION=us-east-1
S3_BUCKET=<your-bucket>

LOCKOUT_MAX_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
LOCKOUT_MAX_DURATION_MINUTES=1440
LOCKOUT_WINDOW_MINUTES=30
LOCKOUT_PROGRESSIVE_MULTIPLIER=2

# Optional - disable Swagger in production
ENABLE_SWAGGER=false

# Optional - other integrations as needed
TELEGRAM_BOT_TOKEN=
TELEGRAM_ENABLED=false
```

- [ ] Save all variables

---

## Deployment (Phase 3)

### Trigger Initial Deployment ✓

**Method 1: Automatic (Git Push)**

```bash
# Make a small change to trigger deployment
git add .
git commit -m "chore: trigger Railway deployment"
git push origin main

# Railway will automatically:
# 1. Detect the push
# 2. Build Docker image
# 3. Run Prisma migrations
# 4. Deploy container
```

**Method 2: Manual in Railway Dashboard**

- [ ] In Railway → API Service
- [ ] Click "Redeploy"
- [ ] Select: "Deploy latest commit"

### Monitor Deployment Progress ✓

- [ ] Watch build logs in Railway Dashboard
  - Expected duration: 2-5 minutes
  - Look for: "Build completed successfully"

- [ ] Check deployment logs after build
  - Look for: "Server is running on: 0.0.0.0:3001"
  - Look for: "Successfully applied migrations"
  - Look for: "Connected to PostgreSQL"
  - Look for: "Connected to Redis"

- [ ] Verify service status
  - Should show: "Running" (green status)
  - Services should be connected

---

## Verification (Phase 4)

### Test Deployment ✓

1. **Get your API domain**
   - In Railway → API Service
   - Copy the domain shown (e.g., `api-production-abc123.railway.app`)

2. **Test health endpoint**
   ```bash
   curl https://api-production-abc123.railway.app/health
   
   # Expected response:
   # {"status":"ok"}
   ```

3. **Test API documentation**
   - Visit: `https://api-production-abc123.railway.app/api/docs`
   - Should show Swagger UI

4. **Run sample API call**
   ```bash
   curl -X GET https://api-production-abc123.railway.app/api/v1/health
   ```

5. **Check logs for errors**
   - In Railway Dashboard
   - Look for "ERROR" or "CRITICAL" messages
   - All should be "INFO" level after startup

### Verify Services Connection ✓

- [ ] **Database Connection**
  - Check Railway logs for: "Connected to PostgreSQL"
  - Or test: `SELECT 1` in database client

- [ ] **Redis Connection**
  - Check Railway logs for: "Connected to Redis"
  - Should be listed in Services with green status

- [ ] **External Services**
  - If using OAuth, verify credentials work
  - If using S3, verify bucket is accessible
  - If using Resend, verify API key is valid

### Test Critical Features ✓

- [ ] Health check endpoint responds
- [ ] Database queries work (check logs)
- [ ] Authentication works (if you have test user)
- [ ] File uploads work (if applicable)
- [ ] External API integrations work

---

## Post-Deployment (Phase 5)

### Optional: Set Custom Domain ✓

- [ ] In Railway → API Service → Settings
- [ ] Add Domain
- [ ] Enter your domain: `api.yourdomain.com`
- [ ] Follow DNS setup instructions
- [ ] Update `FRONTEND_URL` environment variable

### Optional: Enable Monitoring ✓

- [ ] In Railway → Project Settings
- [ ] Enable alerts for:
  - [ ] High memory usage
  - [ ] High CPU usage
  - [ ] Deployment failures

- [ ] Set up logging (view in logs tab)

### Optional: Configure Backups ✓

- [ ] In Railway → PostgreSQL Service
- [ ] Enable automatic backups
- [ ] Set retention: 7-30 days
- [ ] Test backup restore (important!)

### Document Configuration ✓

- [ ] Create internal documentation
  - API domain: `________`
  - PostgreSQL host: `________`
  - Redis host: `________`
  - Contact person: `________`

- [ ] Share access with team
  - Railroad invite link
  - API documentation link
  - Monitoring dashboard link

---

## Troubleshooting Quick Reference

### If Build Fails

```
Check: Dockerfile syntax
Run: docker build . -f Dockerfile
Fix: Review error message in Railway logs
```

### If Container Doesn't Start

```
Check: All environment variables set
Check: DATABASE_URL and REDIS_URL are present
Check: Services are running (PostgreSQL, Redis)
Fix: Restart API service in Railway dashboard
```

### If Migrations Don't Run

```
Check: DATABASE_URL is correct
Check: PostgreSQL service is running
Check: Prisma schema is valid
Fix: Check logs for specific Prisma error
```

### If API Returns 502 Bad Gateway

```
Check: Container is running (status = green)
Check: Application listening on port 3001
Check: No unhandled errors in logs
Fix: Restart container or redeploy
```

### If Database Connection Fails

```
Check: DATABASE_URL is in environment variables
Check: PostgreSQL service is created and running
Check: SSL mode is correct (?sslmode=require)
Fix: Regenerate DATABASE_URL from Railway
```

---

## Success Criteria

✅ **Your API is successfully deployed when:**

1. Build completes without errors
2. Container starts and shows "Server is running"
3. Migrations complete successfully
4. Health endpoint responds
5. API documentation is accessible
6. Database queries work
7. No critical errors in logs
8. Services are connected (PostgreSQL, Redis)

---

## Next Steps

1. **Connect Frontend**
   - Update API URL in web app
   - Test authentication flow
   - Verify CORS works

2. **Monitor Performance**
   - Watch memory and CPU usage
   - Set up alerts
   - Optimize if needed

3. **Update DNS/Domain**
   - Point custom domain to Railway
   - Update OAuth redirect URIs
   - Update CORS allow-list

4. **Set Up CI/CD** (Optional)
   - Add GitHub Actions for automatic testing
   - Deploy on successful tests
   - Track deployment history

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Troubleshooting Guide**: RAILWAY_DEPLOYMENT_GUIDE.md
- **NestJS Docs**: https://docs.nestjs.com
- **Prisma Docs**: https://www.prisma.io/docs

---

**Status**: Ready for deployment ✅

Last updated: February 12, 2026
