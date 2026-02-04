-- Add blurHash, width, and height columns to user_files table
-- These columns support progressive image loading

ALTER TABLE "user_files" ADD COLUMN IF NOT EXISTS "blurHash" TEXT;
ALTER TABLE "user_files" ADD COLUMN IF NOT EXISTS "width" INTEGER;
ALTER TABLE "user_files" ADD COLUMN IF NOT EXISTS "height" INTEGER;
