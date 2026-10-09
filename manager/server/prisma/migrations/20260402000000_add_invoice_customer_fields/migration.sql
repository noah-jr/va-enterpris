-- AlterTable: Add customerName and customerNif to Invoice for ad-hoc/performance invoices
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "customerNif" TEXT;

-- AlterTable: Add sourceBilling, keyVersion, systemEntryDate, invoiceStatusDate, hash, hashControl
-- (SAF-T AGT compliance fields added alongside the customer fields)
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "sourceBilling" TEXT NOT NULL DEFAULT 'P';
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "keyVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "systemEntryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "invoiceStatusDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "hash" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "hashControl" TEXT;

-- AlterTable: Add description and discount to InvoiceItem (SAF-T line fields)
ALTER TABLE "InvoiceItem" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "InvoiceItem" ADD COLUMN IF NOT EXISTS "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;
