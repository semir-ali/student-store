/*
  Warnings:

  - Made the column `customer_id` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "customer_id" SET NOT NULL;
