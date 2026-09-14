import { NextRequest } from "next/server";
import { getOrderById } from "@/server/services/order.service";
import { serializeOrder } from "@/server/serialize";
import { jsonError, jsonOk } from "@/lib/http";
import { connectionErrorResponse } from "@/lib/prisma-errors";
import { AppError } from "@/server/errors";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const order = await getOrderById(id);
    return jsonOk({ order: serializeOrder(order) });
  } catch (e) {
    if (e instanceof AppError) {
      return jsonError(e.message, e.statusCode);
    }
    const conn = connectionErrorResponse(e);
    if (conn) {
      console.error(e);
      return jsonError(conn.message, conn.status);
    }
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
