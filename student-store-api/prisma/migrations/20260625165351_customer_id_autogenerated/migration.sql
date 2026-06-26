-- AlterTable
CREATE SEQUENCE order_customer_id_seq;
ALTER TABLE "Order" ALTER COLUMN "customer_id" SET DEFAULT nextval('order_customer_id_seq');
ALTER SEQUENCE order_customer_id_seq OWNED BY "Order"."customer_id";
