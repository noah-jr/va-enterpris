-- AlterTable
ALTER TABLE `email_settings`
    ADD COLUMN `otp_enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `verification_expires_hours` INTEGER NOT NULL DEFAULT 24,
    ADD COLUMN `password_reset_expires_minutes` INTEGER NOT NULL DEFAULT 15;
