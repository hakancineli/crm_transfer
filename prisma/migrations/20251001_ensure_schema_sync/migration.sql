-- DropForeignKey
ALTER TABLE "public"."beyannameler" DROP CONSTRAINT "beyannameler_smmm_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."beyannameler" DROP CONSTRAINT "beyannameler_taxpayer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."borc_sorgulama" DROP CONSTRAINT "borc_sorgulama_smmm_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."borc_sorgulama" DROP CONSTRAINT "borc_sorgulama_taxpayer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."charge_items" DROP CONSTRAINT "charge_items_smmm_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."charge_items" DROP CONSTRAINT "charge_items_taxpayer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_taxpayer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."earsiv_credentials" DROP CONSTRAINT "earsiv_credentials_smmm_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."earsiv_credentials" DROP CONSTRAINT "earsiv_credentials_taxpayer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."earsiv_invoices" DROP CONSTRAINT "earsiv_invoices_smmm_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."earsiv_invoices" DROP CONSTRAINT "earsiv_invoices_taxpayer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."edevlet_credentials" DROP CONSTRAINT "edevlet_credentials_smmm_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."edevlet_credentials" DROP CONSTRAINT "edevlet_credentials_taxpayer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."etebligat" DROP CONSTRAINT "etebligat_smmm_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."etebligat" DROP CONSTRAINT "etebligat_taxpayer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_smmm_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_taxpayer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."smmm_accounts" DROP CONSTRAINT "smmm_accounts_superuser_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."taxpayer_notes" DROP CONSTRAINT "taxpayer_notes_smmm_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."taxpayer_notes" DROP CONSTRAINT "taxpayer_notes_taxpayer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."taxpayers" DROP CONSTRAINT "taxpayers_smmm_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."vergi_levhalari" DROP CONSTRAINT "vergi_levhalari_smmm_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."vergi_levhalari" DROP CONSTRAINT "vergi_levhalari_taxpayer_id_fkey";

-- AlterTable
ALTER TABLE "public"."Reservation" ADD COLUMN     "email" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'transfer';

-- DropTable
DROP TABLE "public"."beyannameler";

-- DropTable
DROP TABLE "public"."borc_sorgulama";

-- DropTable
DROP TABLE "public"."charge_items";

-- DropTable
DROP TABLE "public"."documents";

-- DropTable
DROP TABLE "public"."earsiv_credentials";

-- DropTable
DROP TABLE "public"."earsiv_invoices";

-- DropTable
DROP TABLE "public"."edevlet_credentials";

-- DropTable
DROP TABLE "public"."etebligat";

-- DropTable
DROP TABLE "public"."payments";

-- DropTable
DROP TABLE "public"."smmm_accounts";

-- DropTable
DROP TABLE "public"."superusers";

-- DropTable
DROP TABLE "public"."taxpayer_notes";

-- DropTable
DROP TABLE "public"."taxpayers";

-- DropTable
DROP TABLE "public"."vergi_levhalari";

-- DropTable
DROP TABLE "public"."whatsapp_messages";

-- DropEnum
DROP TYPE "public"."ChargeStatus";

-- DropEnum
DROP TYPE "public"."DocumentType";

-- DropEnum
DROP TYPE "public"."MessageStatus";

-- DropEnum
DROP TYPE "public"."MessageType";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."Platform";

