-- CreateTable
CREATE TABLE "form_email_verifications" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_email_verifications_formId_idx" ON "form_email_verifications"("formId");

-- CreateIndex
CREATE INDEX "form_email_verifications_formId_email_verified_idx" ON "form_email_verifications"("formId", "email", "verified");

-- CreateIndex
CREATE INDEX "form_email_verifications_expiresAt_idx" ON "form_email_verifications"("expiresAt");

-- AddForeignKey
ALTER TABLE "form_email_verifications" ADD CONSTRAINT "form_email_verifications_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_email_verifications" ADD CONSTRAINT "form_email_verifications_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "form_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
