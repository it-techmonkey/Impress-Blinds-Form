import { prisma } from "@/lib/db";
import { NotFoundError } from "@/server/errors";
import type { CreateOrderInput } from "@/server/validation/schemas";

export async function createOrder(input: CreateOrderInput) {
  return prisma.order.create({
    data: {
      agentName: input.agentName,
      customerName: input.customerName,
      customerAddress: input.customerAddress,
      customerPostcode: input.customerPostcode,
      customerTel: input.customerTel,
      customerMobile: input.customerMobile,
      orderDate: new Date(input.orderDate),
      takeOldBlindsOff: input.takeOldBlindsOff,
      measurerSignature: input.measurerSignature,
      customerSignature: input.customerSignature,
      depositAmountPence: input.depositAmountPence,
      totalAmountPence: input.totalAmountPence,
      balanceDuePence: input.balanceDuePence,
      paymentMethod: input.paymentMethod,
      fittingDate: input.fittingDate ? new Date(input.fittingDate) : undefined,
      rows: {
        create: input.rows.map((row) => ({
          rowNumber: row.rowNumber,
          area: row.area,
          widthMm: row.widthMm,
          dropMm: row.dropMm,
          chainCordControl: row.chainCordControl,
          wandControl: row.wandControl,
          control: row.control,
          comments: row.comments,
        })),
      },
    },
    include: { rows: true },
  });
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { rows: { orderBy: { rowNumber: "asc" } } },
  });
  if (!order) throw new NotFoundError("Order not found");
  return order;
}

export async function listOrders(page: number, limit: number) {
  const [data, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count(),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
