-- Utilizadores: nome de apresentação
ALTER TABLE `users` ADD COLUMN `name` VARCHAR(255) NULL;

-- Roles de sistema (criados pelo seed) não podem ser eliminados/renomeados
ALTER TABLE `roles` ADD COLUMN `is_system` BOOLEAN NOT NULL DEFAULT false;
UPDATE `roles` SET `is_system` = true WHERE `name` IN ('ADMINISTRATOR', 'CONSULTANT', 'SUPPORT');

-- Códigos OTP (6 dígitos, guardados como HMAC) nos tokens enviados por email
ALTER TABLE `email_verification_tokens`
    ADD COLUMN `otp_hash` CHAR(64) NULL,
    ADD COLUMN `otp_attempts` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `client_password_reset_tokens`
    ADD COLUMN `otp_hash` CHAR(64) NULL,
    ADD COLUMN `otp_attempts` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `user_password_reset_tokens`
    ADD COLUMN `otp_hash` CHAR(64) NULL,
    ADD COLUMN `otp_attempts` INTEGER NOT NULL DEFAULT 0;

-- Planos: moeda por omissão passa a ser Kwanza. Os valores existentes NÃO são
-- convertidos automaticamente (89 EUR ≠ 89 AOA) — os planos do seed recebem preços AOA.
ALTER TABLE `plans` MODIFY `currency` VARCHAR(3) NOT NULL DEFAULT 'AOA';

-- Subscrições de clientes
CREATE TABLE `client_subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `client_id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `status` ENUM('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `billing_cycle` ENUM('MONTHLY', 'ANNUAL') NOT NULL DEFAULT 'MONTHLY',
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'AOA',
    `start_date` DATETIME(3) NOT NULL,
    `current_period_end` DATETIME(3) NOT NULL,
    `cancelled_at` DATETIME(3) NULL,
    `notes` VARCHAR(1000) NULL,
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `client_subscriptions_client_id_idx`(`client_id`),
    INDEX `client_subscriptions_plan_id_idx`(`plan_id`),
    INDEX `client_subscriptions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `client_subscriptions` ADD CONSTRAINT `client_subscriptions_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `client_subscriptions` ADD CONSTRAINT `client_subscriptions_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `client_subscriptions` ADD CONSTRAINT `client_subscriptions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Configuração do servidor de email (linha única)
CREATE TABLE `email_settings` (
    `id` VARCHAR(20) NOT NULL DEFAULT 'default',
    `provider` VARCHAR(20) NOT NULL DEFAULT 'SMTP',
    `host` VARCHAR(255) NOT NULL,
    `port` INTEGER NOT NULL,
    `secure` BOOLEAN NOT NULL DEFAULT false,
    `username` VARCHAR(255) NULL,
    `password_encrypted` VARCHAR(1024) NULL,
    `from_name` VARCHAR(255) NOT NULL,
    `from_email` VARCHAR(255) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `updated_by_id` VARCHAR(36) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
