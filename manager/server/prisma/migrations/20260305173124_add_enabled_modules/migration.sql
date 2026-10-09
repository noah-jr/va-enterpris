-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "enabledModules" TEXT[] DEFAULT ARRAY[]::TEXT[];
