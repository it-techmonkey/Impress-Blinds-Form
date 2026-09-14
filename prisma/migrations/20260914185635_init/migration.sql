-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BT', 'CASH');

-- CreateEnum
CREATE TYPE "ControlType" AS ENUM ('T', 'FF');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "job_number" SERIAL NOT NULL,
    "agent_name" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_address" TEXT NOT NULL,
    "customer_postcode" TEXT NOT NULL,
    "customer_tel" TEXT NOT NULL,
    "customer_mobile" TEXT,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "take_old_blinds_off" BOOLEAN NOT NULL DEFAULT false,
    "measurer_signature" TEXT NOT NULL,
    "customer_signature" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deposit_amount_pence" INTEGER NOT NULL,
    "total_amount_pence" INTEGER NOT NULL,
    "balance_due_pence" INTEGER NOT NULL,
    "payment_method" "PaymentMethod",
    "fitting_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_rows" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "area" TEXT NOT NULL,
    "width_mm" INTEGER NOT NULL,
    "drop_mm" INTEGER NOT NULL,
    "chain_cord_control" TEXT,
    "wand_control" TEXT,
    "control" "ControlType",
    "comments" TEXT,

    CONSTRAINT "measurement_rows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_job_number_key" ON "orders"("job_number");

-- CreateIndex
CREATE INDEX "measurement_rows_order_id_idx" ON "measurement_rows"("order_id");

-- AddForeignKey
ALTER TABLE "measurement_rows" ADD CONSTRAINT "measurement_rows_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
