import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/server/services/order.service";
import { buildOrderPdf } from "@/server/services/order-pdf.service";
import { jsonError } from "@/lib/http";
import { connectionErrorResponse } from "@/lib/prisma-errors";
import { AppError } from "@/server/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const order = await getOrderById(id);

    const buffer = await buildOrderPdf(order);
    const filename = `order-${order.jobNumber}.pdf`;
    const body = new Uint8Array(buffer);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    if (e instanceof AppError) {
      return jsonError(e.message, e.statusCode);
    }
    const conn = connectionErrorResponse(e);
    if (conn) {
      console.error("[order-pdf]", e);
      return jsonError(conn.message, conn.status);
    }
    console.error("[order-pdf]", e);
    return jsonError("Internal server error", 500);
  }
}
