import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/server/services/order.service";
import { serializeOrder } from "@/server/serialize";
import { formatPence } from "@/lib/money";
import { AGREEMENT_TEXT, COMPANY_LETTERHEAD, CUSTOMER_CONFIRMATION_TEXT, PAYMENT_METHOD_LABELS, TERMS_SMALL_PRINT } from "@/lib/site";
import { sheetLabelClass, sheetSectionClass, sheetSectionHeadingClass } from "@/lib/sheet-styles";
import { OrderPdfLink } from "@/components/OrderPdfLink";
import { NotFoundError } from "@/server/errors";

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  let order;
  try {
    order = serializeOrder(await getOrderById(id));
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  return (
    <main className="min-h-screen bg-gray-100 px-2 py-6 sm:px-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <Link
            href="/orders"
            className="inline-block rounded-full border-2 border-gray-800 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-800 hover:text-white"
          >
            ← Back to Orders
          </Link>
        </div>
        <div className="flex flex-col gap-4 border-2 border-gray-400 bg-white p-4 shadow-sm sm:p-6">
          <header className="flex flex-col gap-1 border-b-2 border-gray-800 pb-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900">{COMPANY_LETTERHEAD.name}</h1>
              <p className="text-xs text-gray-500">{COMPANY_LETTERHEAD.addressLines.join(", ")}</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className="text-sm font-bold text-gray-900">Job #{order.jobNumber}</span>
              <OrderPdfLink orderId={order.id} />
            </div>
          </header>

          <section className={sheetSectionClass}>
            <h2 className={sheetSectionHeadingClass}>Customer</h2>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div><dt className={sheetLabelClass}>Agent</dt><dd>{order.agentName}</dd></div>
              <div><dt className={sheetLabelClass}>Date</dt><dd>{order.orderDate.slice(0, 10)}</dd></div>
              <div><dt className={sheetLabelClass}>Customer Name</dt><dd>{order.customerName}</dd></div>
              <div><dt className={sheetLabelClass}>Post Code</dt><dd>{order.customerPostcode}</dd></div>
              <div className="sm:col-span-2"><dt className={sheetLabelClass}>Customer Address</dt><dd>{order.customerAddress}</dd></div>
              <div><dt className={sheetLabelClass}>Tel</dt><dd>{order.customerTel}</dd></div>
              <div><dt className={sheetLabelClass}>Mobile</dt><dd>{order.customerMobile ?? "—"}</dd></div>
            </dl>
          </section>

          <section className={sheetSectionClass}>
            <h2 className={sheetSectionHeadingClass}>Measurements</h2>
            <div className="overflow-x-auto rounded-sm border border-gray-400">
              <table className="w-full min-w-190 border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-8 border border-gray-400 bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700" rowSpan={2}>#</th>
                    <th className="w-32 border border-gray-400 bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700" rowSpan={2}>Area</th>
                    <th className="w-16 border border-gray-400 bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700" rowSpan={2}>W</th>
                    <th className="w-16 border border-gray-400 bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700" rowSpan={2}>D</th>
                    <th className="w-28 border border-gray-400 bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700" rowSpan={2}>Chain &amp; Cord Control</th>
                    <th className="w-24 border border-gray-400 bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700" rowSpan={2}>Wand Control</th>
                    <th className="w-24 border border-gray-400 bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700" colSpan={2}>Control</th>
                    <th className="border border-gray-400 bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700" rowSpan={2}>Comments</th>
                  </tr>
                  <tr>
                    <th className="w-12 border border-gray-400 bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700">T</th>
                    <th className="w-12 border border-gray-400 bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700">FF</th>
                  </tr>
                </thead>
                <tbody>
                  {order.rows.map((row) => (
                    <tr key={row.id} className="even:bg-gray-50">
                      <td className="border border-gray-300 px-1.5 py-1 text-center font-semibold text-gray-500">{row.rowNumber}</td>
                      <td className="border border-gray-300 px-1.5 py-1">{row.area}</td>
                      <td className="border border-gray-300 px-1.5 py-1">{row.widthMm}</td>
                      <td className="border border-gray-300 px-1.5 py-1">{row.dropMm}</td>
                      <td className="border border-gray-300 px-1.5 py-1">{row.chainCordControl ?? ""}</td>
                      <td className="border border-gray-300 px-1.5 py-1">{row.wandControl ?? ""}</td>
                      <td className="border border-gray-300 px-1.5 py-1 text-center">{row.control === "T" ? "✓" : ""}</td>
                      <td className="border border-gray-300 px-1.5 py-1 text-center">{row.control === "FF" ? "✓" : ""}</td>
                      <td className="border border-gray-300 px-1.5 py-1">{row.comments ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <label className="flex items-center gap-2.5 border-2 border-gray-300 p-3 text-sm font-semibold text-gray-800">
            <input type="checkbox" className="h-5 w-5 accent-gray-800" checked={order.takeOldBlindsOff} readOnly />
            Please Take Old Blinds Off
          </label>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className={sheetSectionClass}>
              <h2 className={sheetSectionHeadingClass}>Measurer Signature</h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.measurerSignature} alt="Measurer signature" className="h-32 w-full border-2 border-gray-300 bg-white object-contain" />
            </section>

            <section className={sheetSectionClass}>
              <h2 className={sheetSectionHeadingClass}>Agreement</h2>
              <div className="text-xs leading-relaxed text-gray-600">
                {AGREEMENT_TEXT.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <p className="text-xs font-semibold text-gray-800">{CUSTOMER_CONFIRMATION_TEXT}</p>
              <span className={sheetLabelClass}>Customer Signature</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.customerSignature} alt="Customer signature" className="h-32 w-full border-2 border-gray-300 bg-white object-contain" />
            </section>
          </div>

          <section className={sheetSectionClass}>
            <h2 className={sheetSectionHeadingClass}>Payment</h2>
            <div className="border-2 border-gray-800 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-800">Bank Details</p>
              <p className="text-sm font-semibold text-gray-900">
                Account Number: {COMPANY_LETTERHEAD.bankDetails.accountNumber} &nbsp; Sort Code:{" "}
                {COMPANY_LETTERHEAD.bankDetails.sortCode}
              </p>
              <p className="text-sm font-bold text-gray-900">We do not accept cheques.</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
              <div><dt className={sheetLabelClass}>Deposit</dt><dd>{formatPence(order.depositAmountPence)}</dd></div>
              <div><dt className={sheetLabelClass}>Total</dt><dd>{formatPence(order.totalAmountPence)}</dd></div>
              <div><dt className={sheetLabelClass}>Balance Due</dt><dd>{formatPence(order.balanceDuePence)}</dd></div>
              <div><dt className={sheetLabelClass}>Fitting Date</dt><dd>{order.fittingDate ? order.fittingDate.slice(0, 10) : "—"}</dd></div>
            </dl>
            <div className="flex flex-col gap-1.5">
              <span className={sheetLabelClass}>Payment Method</span>
              <div className="flex gap-3">
                {(["CARD", "BT", "CASH"] as const).map((method) => {
                  const selected = order.paymentMethod === method;
                  return (
                    <div
                      key={method}
                      className={`flex flex-1 items-center justify-center gap-2 border-2 py-2.5 text-sm font-semibold ${
                        selected ? "border-gray-800 bg-gray-800 text-white" : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <span className={`flex h-4 w-4 items-center justify-center border ${selected ? "border-white" : "border-gray-500"}`}>
                        {selected && "✓"}
                      </span>
                      {PAYMENT_METHOD_LABELS[method]}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <p className="text-[10px] leading-relaxed text-gray-400">
            {TERMS_SMALL_PRINT.join(" ")}
          </p>
        </div>
      </div>
    </main>
  );
}
