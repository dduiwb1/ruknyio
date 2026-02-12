# Fix: Missing tables on Railway (account_lockouts, login_attempts, whatsapp_otps)

## Cause

The Prisma schema defines `AccountLockout`, `LoginAttempt`, `WhatsappOtp`, `WhatsappNotification`, and `IPLockout`, but the migrations that create these tables were never applied on the Railway database. The API and cleanup jobs then fail with:

- `The table 'public.account_lockouts' does not exist`
- `The table 'public.login_attempts' does not exist`
- `The table 'public.whatsapp_otps' does not exist`

## Fix

A new Prisma migration was added that creates these tables and any required enums:

- **Migration:** `20260213000000_add_auth_lockout_and_whatsapp_tables`
- **Location:** `apps/api/prisma/migrations/20260213000000_add_auth_lockout_and_whatsapp_tables/migration.sql`

It creates (if not already present):

- `account_lockouts`
- `login_attempts`
- `ip_lockouts`
- `whatsapp_otps`
- `whatsapp_notifications`

and ensures `users` has `phoneNumber`, `phoneVerified`, `phoneVerifiedAt`, and `accountType` (if missing).

## What you need to do

### If `prisma migrate deploy` says "No pending migrations"

Your DB is likely in a **divergent** state: the database has a migration applied that no longer exists locally (e.g. `20260204_add_userfile_blurhash`). Prisma then won't apply new migrations until the histories match.

**Fix it once (against your Railway DB), then deploy:**

1. **Resolve the missing/failed migration** so the DB history matches your repo:

   ```bash
   cd apps/api
   # Use DATABASE_URL and DIRECT_URL from Railway (Variables)
   npx prisma migrate resolve --rolled-back "20260204_add_userfile_blurhash"
   ```

2. **Apply the new migration** (creates the missing tables):

   ```bash
   npx prisma migrate deploy
   ```

   You should see `20260213000000_add_auth_lockout_and_whatsapp_tables` applied.

3. **Redeploy the API** on Railway. Future deploys will run `npm run migrate` at startup as usual.

### If there is no divergent migration

1. **Commit and push** the new migration (and this doc) to your repo.
2. **Redeploy the API service** on Railway.

On startup, the API runs `npm run migrate` (see `apps/api/Dockerfile`), which runs `prisma migrate deploy` and will apply any pending migrations.

## Check status

To see which migrations Prisma sees and what's applied:

```bash
cd apps/api
npx prisma migrate status
```

- **"Migrations not yet applied"** lists what will run on next `migrate deploy`.
- **"Migrations from the database are not found locally"** means you must run `migrate resolve --rolled-back "MIGRATION_NAME"` (as above) before deploy will apply new ones.

See `apps/api/prisma/resolve-failed-migration.md` for more on failed/rolled-back migrations.
