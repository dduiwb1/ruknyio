# Database Connectivity Issues - Solution

## Problem
The application was experiencing P1001 Prisma errors: "Can't reach database server at `ep-frosty-sea-ah26uchk-pooler.c-3.us-east-1.aws.neon.tech:5432`"

This was happening during scheduled database cleanup tasks and causing the entire cleanup operation to fail with 8 failed tasks.

## Root Causes
1. **Database Downtime**: Neon database was temporarily unreachable
2. **Network Connectivity**: Transient network issues between application and database
3. **No Error Resilience**: The cleanup service wasn't handling connection failures gracefully

## Solution Implemented

### 1. **Pre-flight Database Check**
Added `isDatabaseReachable()` method that verifies connectivity before running cleanup:
- Sends a simple `SELECT 1` query to test connection
- Gracefully skips cleanup if database is unreachable
- Prevents cascading errors from connection failures

### 2. **Individual Task Error Handling**
Wrapped each cleanup method in try-catch blocks:
- `cleanupExpiredSessions()`
- `cleanupExpiredOTPs()`
- `cleanupOldSecurityLogs()`
- `cleanupOldLoginAttempts()`
- `cleanupExpiredPending2FA()`
- `cleanupOldWebhookLogs()`
- `cleanupExpiredVerificationCodes()`
- `cleanupExpiredQuickSignLinks()`

Each method now returns 0 (no records cleaned) on error instead of throwing.

### 3. **Smart Error Classification**
Added `handleCleanupError()` helper that distinguishes between:
- **Connection errors (P1001)**: Logged as warnings (non-critical, will retry)
- **Prisma errors**: Logged appropriately by error code
- **Unexpected errors**: Full error logging for investigation

### 4. **Improved Logging**
- Connection failures now show as warnings, not errors
- Clear indication that cleanup will retry in the next cycle
- No more alarming error stack traces for transient issues

## Configuration

### Enable/Disable Cleanup
```bash
# .env
ENABLE_CLEANUP_CRON=true   # Enable (default)
ENABLE_CLEANUP_CRON=false  # Disable
```

### What's Cleaned
Runs every hour and cleans up:
- Expired sessions (14+ days old)
- Expired OTPs
- Old security logs (90+ days)
- Old login attempts (90+ days)
- Expired 2FA sessions
- Old webhook logs (30+ days)
- Expired verification codes
- Expired QuickSign links (7+ days old or used)

## Monitoring

Check logs for cleanup status:
```bash
# Successful cleanup
✅ Database cleanup completed in 1500ms (8 successful)

# Database unreachable (non-critical)
⚠️ Database is currently unreachable. Cleanup will retry in the next cycle.

# Task failures
Cleanup task 0 skipped: Database temporarily unreachable.
```

## Database Connection Best Practices

### Neon PostgreSQL Configuration
```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require&connection_limit=10&pool_timeout=20"
```

### Recommended Settings
- `connection_limit`: 10 (prevents pool exhaustion)
- `pool_timeout`: 20s (adequate for serverless cold starts)
- `sslmode=require`: Always use SSL for remote connections

### Troubleshooting Connection Issues
1. **Verify DATABASE_URL is set**: Check environment variables
2. **Check Neon console**: Ensure database is running
3. **Test connectivity**: `psql <DATABASE_URL>`
4. **Check firewall/security groups**: Verify network access
5. **Monitor connection pools**: Don't exceed configured limits

## Performance Impact
- Pre-flight check adds ~100ms if database is reachable
- Failed cleanup tasks return immediately (minimal overhead)
- No blocking of application startup

## Next Steps
If database connectivity issues persist:
1. Check Neon dashboard for database status
2. Verify network connectivity to the database host
3. Review connection pool settings if using connection pooler
4. Consider enabling detailed query logs in production
