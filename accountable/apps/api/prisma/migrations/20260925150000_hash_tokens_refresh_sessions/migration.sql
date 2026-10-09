-- Tokens públicos passam a ser guardados apenas como SHA-256 (hex).
-- Os tokens existentes são convertidos com SHA2(), pelo que links já enviados continuam válidos.

-- ------------------------------------------------------------
-- client_upload_sessions
-- ------------------------------------------------------------
ALTER TABLE `client_upload_sessions` DROP FOREIGN KEY `client_upload_sessions_created_by_user_id_fkey`;

ALTER TABLE `client_upload_sessions`
    ADD COLUMN `token_hash` CHAR(64) NULL,
    ADD COLUMN `token_encrypted` VARCHAR(255) NULL,
    ADD COLUMN `expires_at` DATETIME(3) NULL,
    MODIFY `created_by_user_id` VARCHAR(191) NULL;

-- Sessões legadas não tinham expiração: ganham 30 dias a partir de agora.
-- token_encrypted fica NULL (o URL destas sessões deixa de poder ser recopiado).
UPDATE `client_upload_sessions`
SET `token_hash` = SHA2(`token`, 256),
    `expires_at` = DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 30 DAY);

ALTER TABLE `client_upload_sessions`
    MODIFY `token_hash` CHAR(64) NOT NULL,
    MODIFY `expires_at` DATETIME(3) NOT NULL;

DROP INDEX `client_upload_sessions_token_key` ON `client_upload_sessions`;
ALTER TABLE `client_upload_sessions` DROP COLUMN `token`;
CREATE UNIQUE INDEX `client_upload_sessions_token_hash_key` ON `client_upload_sessions`(`token_hash`);

ALTER TABLE `client_upload_sessions` ADD CONSTRAINT `client_upload_sessions_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ------------------------------------------------------------
-- document_upload_links
-- ------------------------------------------------------------
ALTER TABLE `document_upload_links` ADD COLUMN `token_hash` CHAR(64) NULL;
UPDATE `document_upload_links` SET `token_hash` = SHA2(`token`, 256);
ALTER TABLE `document_upload_links` MODIFY `token_hash` CHAR(64) NOT NULL;

DROP INDEX `document_upload_links_token_key` ON `document_upload_links`;
ALTER TABLE `document_upload_links` DROP COLUMN `token`;
CREATE UNIQUE INDEX `document_upload_links_token_hash_key` ON `document_upload_links`(`token_hash`);

-- ------------------------------------------------------------
-- email_verification_tokens
-- ------------------------------------------------------------
ALTER TABLE `email_verification_tokens` ADD COLUMN `token_hash` CHAR(64) NULL;
UPDATE `email_verification_tokens` SET `token_hash` = SHA2(`token`, 256);
ALTER TABLE `email_verification_tokens` MODIFY `token_hash` CHAR(64) NOT NULL;

DROP INDEX `email_verification_tokens_token_key` ON `email_verification_tokens`;
ALTER TABLE `email_verification_tokens` DROP COLUMN `token`;
CREATE UNIQUE INDEX `email_verification_tokens_token_hash_key` ON `email_verification_tokens`(`token_hash`);

-- ------------------------------------------------------------
-- refresh_sessions
-- ------------------------------------------------------------
CREATE TABLE `refresh_sessions` (
    `id` VARCHAR(36) NOT NULL,
    `family_id` VARCHAR(36) NOT NULL,
    `subject_type` ENUM('CLIENT', 'USER') NOT NULL,
    `subject_id` VARCHAR(36) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `replaced_by_id` VARCHAR(36) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `refresh_sessions_subject_type_subject_id_idx`(`subject_type`, `subject_id`),
    INDEX `refresh_sessions_family_id_idx`(`family_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
