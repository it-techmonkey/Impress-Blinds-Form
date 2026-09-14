import type { MeasurementRow, Order } from "@/generated/prisma/client";

function serializeRow(row: MeasurementRow) {
  return {
    id: row.id,
    rowNumber: row.rowNumber,
    area: row.area,
    widthMm: row.widthMm,
    dropMm: row.dropMm,
    chainCordControl: row.chainCordControl,
    wandControl: row.wandControl,
    control: row.control,
    comments: row.comments,
  };
}

/** List row without measurement rows (lighter DB payload). */
export function serializeOrderRow(order: Order) {
  return {
    id: order.id,
    jobNumber: order.jobNumber,
    agentName: order.agentName,
    customerName: order.customerName,
    customerPostcode: order.customerPostcode,
    totalAmountPence: order.totalAmountPence,
    balanceDuePence: order.balanceDuePence,
    paymentMethod: order.paymentMethod,
    fittingDate: order.fittingDate ? order.fittingDate.toISOString() : null,
    createdAt: order.createdAt.toISOString(),
  };
}

type OrderWithRows = Order & { rows: MeasurementRow[] };

export function serializeOrder(order: OrderWithRows) {
  return {
    id: order.id,
    jobNumber: order.jobNumber,
    agentName: order.agentName,
    customerName: order.customerName,
    customerAddress: order.customerAddress,
    customerPostcode: order.customerPostcode,
    customerTel: order.customerTel,
    customerMobile: order.customerMobile,
    orderDate: order.orderDate.toISOString(),
    takeOldBlindsOff: order.takeOldBlindsOff,
    measurerSignature: order.measurerSignature,
    customerSignature: order.customerSignature,
    signedAt: order.signedAt.toISOString(),
    depositAmountPence: order.depositAmountPence,
    totalAmountPence: order.totalAmountPence,
    balanceDuePence: order.balanceDuePence,
    paymentMethod: order.paymentMethod,
    fittingDate: order.fittingDate ? order.fittingDate.toISOString() : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    rows: order.rows.map(serializeRow),
  };
}
