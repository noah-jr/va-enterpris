-- Migration: soft_delete_tickets_contact_request_enum
-- Adds deletedAt to tickets and ticket_messages (soft delete)
-- Converts contact_requests.status from VARCHAR to ENUM

-- 1. Add soft delete to tickets
ALTER TABLE `tickets`
  ADD COLUMN `deleted_at` DATETIME(3) NULL DEFAULT NULL;

-- 2. Add soft delete to ticket_messages
ALTER TABLE `ticket_messages`
  ADD COLUMN `deleted_at` DATETIME(3) NULL DEFAULT NULL;

-- 3. Convert contact_requests.status from VARCHAR to ENUM
-- Step 1: temporarily allow NULL so we can drop default
ALTER TABLE `contact_requests`
  MODIFY COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'NEW';

-- Step 2: change to ENUM
ALTER TABLE `contact_requests`
  MODIFY COLUMN `status` ENUM('NEW', 'CONTACTED', 'CLOSED') NOT NULL DEFAULT 'NEW';
