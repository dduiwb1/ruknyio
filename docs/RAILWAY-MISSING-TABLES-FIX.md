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

1. **Commit and push** the new migration (and this doc) to your repo.
2. **Redeploy the API service** on Railway.

On startup, the API runs `npm run migrate` (see `apps/api/Dockerfile`), which runs `prisma migrate deploy`. That will apply the new migration and create the tables. No manual SQL or Railway shell is required.

## If you see a failed migration (P3009)

If a previous migration was marked as failed on Railway, resolve it first, then redeploy:

```bash
cd apps/api
# Set DATABASE_URL and DIRECT_URL from Railway variables
npx prisma migrate resolve --rolled-back "MIGRATION_NAME"
```

See `apps/api/prisma/resolve-failed-migration.md` for details.
