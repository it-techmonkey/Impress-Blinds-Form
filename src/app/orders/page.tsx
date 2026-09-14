import Link from "next/link";
import { listOrders } from "@/server/services/order.service";
import { serializeOrderRow } from "@/server/serialize";
import { formatPence } from "@/lib/money";
import { PAYMENT_METHOD_LABELS } from "@/lib/site";

export default async function OrdersPage() {
  const { data } = await listOrders(1, 50);
  const rows = data.map(serializeOrderRow);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <Link
          href="/orders/new"
          className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
        >
          New Order
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No orders submitted yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Job #</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Post Code</th>
                <th className="px-3 py-2">Fitting Date</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Balance Due</th>
                <th className="px-3 py-2">Payment</th>
                <th className="px-3 py-2">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <Link href={`/orders/${order.id}`} className="font-medium text-gray-900 underline">
                      #{order.jobNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{order.customerName}</td>
                  <td className="px-3 py-2">{order.customerPostcode}</td>
                  <td className="px-3 py-2">{order.fittingDate ? order.fittingDate.slice(0, 10) : "—"}</td>
                  <td className="px-3 py-2">{formatPence(order.totalAmountPence)}</td>
                  <td className="px-3 py-2">{formatPence(order.balanceDuePence)}</td>
                  <td className="px-3 py-2">{order.paymentMethod ? PAYMENT_METHOD_LABELS[order.paymentMethod] : "—"}</td>
                  <td className="px-3 py-2 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
