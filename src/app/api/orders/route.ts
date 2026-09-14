import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { paginationSchema, createOrderSchema } from "@/server/validation/schemas";
import { createOrder, listOrders } from "@/server/services/order.service";
import { serializeOrder, serializeOrderRow } from "@/server/serialize";
import { jsonError, jsonOk } from "@/lib/http";
import { connectionErrorResponse } from "@/lib/prisma-errors";
import { AppError } from "@/server/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = paginationSchema.parse(Object.fromEntries(searchParams.entries()));
    const result = await listOrders(page, limit);
    return jsonOk({ data: result.data.map(serializeOrderRow), pagination: result.pagination });
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonError("Validation failed", 400, e.flatten());
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createOrderSchema.parse(body);
    const order = await createOrder(input);
    return jsonOk({ order: serializeOrder(order) }, 201);
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonError("Validation failed", 400, e.flatten());
    }
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
