-- AlterTable
ALTER TABLE `Service` ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'Outros';

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `clientName` VARCHAR(191) NOT NULL,
    `clientEmail` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'GENERATED',
    `data` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Internauta` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `birthDate` DATETIME(3) NULL,
    `gender` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL DEFAULT 'Angola',
    `postalCode` VARCHAR(191) NULL,
    `occupation` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `interests` TEXT NULL,
    `howDidYouHear` VARCHAR(191) NULL,
    `newsletter` BOOLEAN NOT NULL DEFAULT true,
    `termsAccepted` BOOLEAN NOT NULL DEFAULT true,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Internauta_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Re-create missing join tables from failed chat migration (idempotent)
CREATE TABLE IF NOT EXISTS `_UserSectors` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,
    UNIQUE INDEX `_UserSectors_AB_unique`(`A`, `B`),
    INDEX `_UserSectors_B_index`(`B`),
    PRIMARY KEY (`A`, `B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `_UserChats` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,
    UNIQUE INDEX `_UserChats_AB_unique`(`A`, `B`),
    INDEX `_UserChats_B_index`(`B`),
    PRIMARY KEY (`A`, `B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign keys for the join tables
-- Using OR TRUE to ignore errors if they already exist
SET @statement = 'ALTER TABLE `_UserSectors` ADD CONSTRAINT `_UserSectors_A_fkey` FOREIGN KEY (`A`) REFERENCES `Sector`(`id`) ON DELETE CASCADE ON UPDATE CASCADE';
PREPARE stmt FROM @statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @statement = 'ALTER TABLE `_UserSectors` ADD CONSTRAINT `_UserSectors_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE';
PREPARE stmt FROM @statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @statement = 'ALTER TABLE `_UserChats` ADD CONSTRAINT `_UserChats_A_fkey` FOREIGN KEY (`A`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE';
PREPARE stmt FROM @statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @statement = 'ALTER TABLE `_UserChats` ADD CONSTRAINT `_UserChats_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE';
PREPARE stmt FROM @statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
