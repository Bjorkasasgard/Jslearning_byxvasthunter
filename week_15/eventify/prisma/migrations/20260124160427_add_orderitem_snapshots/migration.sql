-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "eventDate" DATETIME;
ALTER TABLE "OrderItem" ADD COLUMN "eventLocation" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "eventTitle" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "ticketName" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "ticketPrice" INTEGER;
