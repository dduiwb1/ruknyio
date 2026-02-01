-- Add deletedAt column to user_files for soft delete (حذف ناعم)
-- الملف يبقى 30 يوم بعد الحذف ثم يُحذف نهائياً

ALTER TABLE "user_files" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "user_files_deletedAt_idx" ON "user_files"("deletedAt");
