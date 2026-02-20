-- Add performance indexes to improve slow query detection
-- These indexes target tables frequently queried during form creation and session management

-- Forms table: Optimize slug lookups (used during form creation/updates)
CREATE INDEX IF NOT EXISTS "forms_slug_idx" ON "forms"("slug");
CREATE INDEX IF NOT EXISTS "forms_userId_createdAt_idx" ON "forms"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "forms_status_userId_idx" ON "forms"("status", "userId");

-- Sessions table: Better index for session queries (used in keepalive)
-- The existing lastActivity index is good, but add composite for faster lookups
CREATE INDEX IF NOT EXISTS "sessions_userId_lastActivity_idx" ON "sessions"("userId", "lastActivity" DESC);
CREATE INDEX IF NOT EXISTS "sessions_refreshTokenHash_idx" ON "sessions"("refreshTokenHash");

-- UserFile table: Speed up file tracking queries
CREATE INDEX IF NOT EXISTS "userFile_userId_category_idx" ON "UserFile"("userId", "category");
CREATE INDEX IF NOT EXISTS "userFile_entityId_idx" ON "UserFile"("entityId");

-- FormField table: Optimize field retrieval
CREATE INDEX IF NOT EXISTS "form_fields_formId_order_idx" ON "form_fields"("formId", "order" ASC);
CREATE INDEX IF NOT EXISTS "form_fields_stepId_order_idx" ON "form_fields"("stepId", "order" ASC);

-- FormStep table: Optimize step queries
CREATE INDEX IF NOT EXISTS "form_steps_formId_order_idx" ON "form_steps"("formId", "order" ASC);

-- FormSubmission table: Speed up submission queries
CREATE INDEX IF NOT EXISTS "form_submissions_formId_createdAt_idx" ON "form_submissions"("formId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "form_submissions_userId_idx" ON "form_submissions"("userId");

-- Profile table: User storage queries
CREATE INDEX IF NOT EXISTS "profile_userId_storageUsed_idx" ON "profiles"("userId", "storageUsed");

-- Event table: Optimize linked event lookups
CREATE INDEX IF NOT EXISTS "events_userId_createdAtidx" ON "events"("userId", "createdAt" DESC);

-- Store table: Optimize linked store lookups
CREATE INDEX IF NOT EXISTS "stores_userId_createdAt_idx" ON "stores"("userId", "createdAt" DESC);
