-- AlterTable
ALTER TABLE "public"."tenants" ADD COLUMN     "paymentAccountHolder" TEXT,
ADD COLUMN     "paymentBank" TEXT,
ADD COLUMN     "paymentIban" TEXT;

-- CreateTable
CREATE TABLE "public"."vehicles" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "lastMaintenance" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tour_bookings" (
    "id" TEXT NOT NULL,
    "voucherNumber" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "groupSize" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "pickupLocation" TEXT NOT NULL,
    "tourDate" TIMESTAMP(3) NOT NULL,
    "tourTime" TEXT,
    "passengerNames" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "driverId" TEXT,
    "driverFee" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tourDuration" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "tour_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tour_bookings_voucherNumber_key" ON "public"."tour_bookings"("voucherNumber");

-- AddForeignKey
ALTER TABLE "public"."vehicles" ADD CONSTRAINT "vehicles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tour_bookings" ADD CONSTRAINT "tour_bookings_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tour_bookings" ADD CONSTRAINT "tour_bookings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tour_bookings" ADD CONSTRAINT "tour_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
