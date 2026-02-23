-- Enforce one store per user
-- Adds a unique constraint on stores.userId.
--
-- Safety: this migration will fail if duplicates exist.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "stores"
    GROUP BY "userId"
    HAVING COUNT(*) > 1
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Cannot enforce one-store-per-user: duplicates exist in stores.userId';
  END IF;
END $$;

-- Create unique index (Prisma will treat as unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS "stores_userId_key" ON "stores"("userId");
