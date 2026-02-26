-- Add verification fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

-- Add VERIFICATION_SCREENSHOT to FileCategory enum
ALTER TYPE "FileCategory" ADD VALUE IF NOT EXISTS 'VERIFICATION_SCREENSHOT';

-- Create VerificationRequestType enum
DO $$ BEGIN
  CREATE TYPE "VerificationRequestType" AS ENUM ('PERSONAL', 'BUSINESS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create VerificationRequestStatus enum
DO $$ BEGIN
  CREATE TYPE "VerificationRequestStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS "verification_requests" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "VerificationRequestType" NOT NULL DEFAULT 'PERSONAL',
  "status" "VerificationRequestStatus" NOT NULL DEFAULT 'PENDING',
  "fullName" TEXT NOT NULL,
  "socialLinks" JSONB,
  "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "businessName" TEXT,
  "businessEmail" TEXT,
  "notes" TEXT,
  "adminNotes" TEXT,
  "rejectionReason" TEXT,
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- Add foreign key
DO $$ BEGIN
  ALTER TABLE "verification_requests"
    ADD CONSTRAINT "verification_requests_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "verification_requests_userId_idx" ON "verification_requests"("userId");
CREATE INDEX IF NOT EXISTS "verification_requests_status_idx" ON "verification_requests"("status");
CREATE INDEX IF NOT EXISTS "verification_requests_createdAt_idx" ON "verification_requests"("createdAt");
