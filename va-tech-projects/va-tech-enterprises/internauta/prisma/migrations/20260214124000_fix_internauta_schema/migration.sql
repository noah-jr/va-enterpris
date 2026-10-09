-- Standard SQL for Prisma migrations (No DELIMITER/PROCEDURE support)

-- Add password column to Internauta
ALTER TABLE `Internauta` ADD COLUMN `password` VARCHAR(191) NULL AFTER `email`;

-- Add image column to Internauta
ALTER TABLE `Internauta` ADD COLUMN `image` VARCHAR(191) NULL AFTER `gender`;
