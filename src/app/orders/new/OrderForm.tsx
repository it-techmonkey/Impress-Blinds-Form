"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MeasurementRowsEditor,
  newMeasurementRow,
  type MeasurementRowDraft,
} from "@/components/MeasurementRowsEditor";
import { SignaturePad } from "@/components/SignaturePad";
import { OrderPdfLink } from "@/components/OrderPdfLink";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft-storage";
import { AGREEMENT_TEXT, COMPANY_LETTERHEAD, CUSTOMER_CONFIRMATION_TEXT } from "@/lib/site";
import { sheetLabelClass as labelClass, sheetSectionClass as sectionClass, sheetSectionHeadingClass as sectionHeadingClass } from "@/lib/sheet-styles";

const inputClass =
  "border-2 border-gray-300 rounded-sm p-2.5 text-sm focus:border-gray-600 outline-none w-full bg-white";

type FormDraft = {
  agentName: string;
  customerName: string;
  customerAddress: string;
  customerPostcode: string;
  customerTel: string;
  customerMobile: string;
  orderDate: string;
  rows: MeasurementRowDraft[];
  takeOldBlindsOff: boolean;
  depositAmount: string;
  totalAmount: string;
  balanceDue: string;
  balanceManuallySet: boolean;
  paymentMethod: "" | "CARD" | "BT" | "CASH";
  fittingDate: string;
};

function emptyDraft(): FormDraft {
  return {
    agentName: "",
    customerName: "",
    customerAddress: "",
    customerPostcode: "",
    customerTel: "",
    customerMobile: "",
    orderDate: new Date().toISOString().slice(0, 10),
    rows: [newMeasurementRow()],
    takeOldBlindsOff: false,
    depositAmount: "",
    totalAmount: "",
    balanceDue: "",
    balanceManuallySet: false,
    paymentMethod: "",
    fittingDate: "",
  };
}

function computeBalance(total: string, deposit: string): string {
  const t = Number.parseFloat(total);
  const d = Number.parseFloat(deposit);
  if (Number.isNaN(t)) return "";
  const balance = t - (Number.isNaN(d) ? 0 : d);
  return balance.toFixed(2);
}

export default function OrderForm() {
  const [draft, setDraft] = useState<FormDraft>(emptyDraft());
  const [measurerSignature, setMeasurerSignature] = useState<string | null>(null);
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const pendingDraftRef = useRef<FormDraft | null>(null);

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; jobNumber: number } | null>(null);

  useEffect(() => {
    const existing = loadDraft<FormDraft>();
    if (existing) {
      // Merge over defaults so a draft saved by an older version of this form
      // (missing fields added since) doesn't leave inputs without a value.
      pendingDraftRef.current = { ...emptyDraft(), ...existing };
      // Hydrating UI state from localStorage on mount — there's no way to know
      // whether a draft exists until after the client renders once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowResumeBanner(true);
    }
  }, []);

  useEffect(() => {
    if (status !== "idle") return;
    const timeout = setTimeout(() => saveDraft(draft), 500);
    return () => clearTimeout(timeout);
  }, [draft, status]);

  function set<K extends keyof FormDraft>(key: K, value: FormDraft[K]) {
    setDraft((prev) => {
      const next = { ...prev, [key]: value };
      if ((key === "totalAmount" || key === "depositAmount") && !next.balanceManuallySet) {
        next.balanceDue = computeBalance(next.totalAmount, next.depositAmount);
      }
      return next;
    });
  }

  function resumeDraft() {
    if (pendingDraftRef.current) setDraft(pendingDraftRef.current);
    setShowResumeBanner(false);
  }

  function discardDraft() {
    clearDraft();
    setShowResumeBanner(false);
  }

  function resetForm() {
    clearDraft();
    setDraft(emptyDraft());
    setMeasurerSignature(null);
    setCustomerSignature(null);
    setCreatedOrder(null);
    setStatus("idle");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!draft.agentName.trim()) return setError("Please enter the agent name.");
    if (!draft.customerName.trim()) return setError("Please enter the customer name.");
    if (!draft.customerAddress.trim()) return setError("Please enter the customer address.");
    if (!draft.customerPostcode.trim()) return setError("Please enter the customer post code.");
    if (!draft.customerTel.trim()) return setError("Please enter a telephone number.");
    if (!draft.orderDate.trim()) return setError("Please enter the date.");
    if (draft.rows.length === 0) return setError("Please add at least one measurement row.");
    for (const [index, row] of draft.rows.entries()) {
      if (!row.area.trim()) return setError(`Row ${index + 1}: area is required.`);
      if (!row.widthMm.trim() || Number(row.widthMm) <= 0) return setError(`Row ${index + 1}: width (mm) is required.`);
      if (!row.dropMm.trim() || Number(row.dropMm) <= 0) return setError(`Row ${index + 1}: drop (mm) is required.`);
    }
    if (!measurerSignature) return setError("Measurer signature is required.");
    if (!customerSignature) return setError("Customer signature is required.");
    if (!draft.totalAmount.trim()) return setError("Please enter the total amount.");

    setStatus("submitting");
    try {
      const payload = {
        agentName: draft.agentName.trim(),
        customerName: draft.customerName.trim(),
        customerAddress: draft.customerAddress.trim(),
        customerPostcode: draft.customerPostcode.trim(),
        customerTel: draft.customerTel.trim(),
        customerMobile: draft.customerMobile.trim() || undefined,
        orderDate: new Date(draft.orderDate).toISOString(),
        takeOldBlindsOff: draft.takeOldBlindsOff,
        measurerSignature,
        customerSignature,
        depositAmountPence: Math.round(Number.parseFloat(draft.depositAmount || "0") * 100),
        totalAmountPence: Math.round(Number.parseFloat(draft.totalAmount || "0") * 100),
        balanceDuePence: Math.round(Number.parseFloat(draft.balanceDue || "0") * 100),
        paymentMethod: draft.paymentMethod || undefined,
        fittingDate: draft.fittingDate ? new Date(draft.fittingDate).toISOString() : undefined,
        rows: draft.rows.map((row, index) => ({
          rowNumber: index + 1,
          area: row.area.trim(),
          widthMm: Number.parseInt(row.widthMm, 10),
          dropMm: Number.parseInt(row.dropMm, 10),
          chainCordControl: row.chainCordControl.trim() || undefined,
          wandControl: row.wandControl.trim() || undefined,
          control: row.control || undefined,
          comments: row.comments.trim() || undefined,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Could not submit the order.");
      }
      clearDraft();
      setCreatedOrder({ id: json.order.id, jobNumber: json.order.jobNumber });
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success" && createdOrder) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Order submitted — Job #{createdOrder.jobNumber}</h2>
        <p className="mt-2 text-sm text-gray-600">The order has been saved.</p>
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <OrderPdfLink orderId={createdOrder.id} />
          <Link
            href={`/orders/${createdOrder.id}`}
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            View order
          </Link>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Start new order
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-2 border-gray-400 bg-white p-4 shadow-sm sm:p-6">
      {showResumeBanner && (
        <div className="flex flex-col items-start gap-2 rounded-sm border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span>You have an unsaved order in progress.</span>
          <div className="flex gap-2">
            <button type="button" onClick={resumeDraft} className="rounded-full bg-amber-900 px-3 py-1 text-xs font-semibold text-white">
              Resume
            </button>
            <button type="button" onClick={discardDraft} className="rounded-full border border-amber-900 px-3 py-1 text-xs font-semibold text-amber-900">
              Discard
            </button>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-1 border-b-2 border-gray-800 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">{COMPANY_LETTERHEAD.name}</h1>
          <p className="text-xs text-gray-500">{COMPANY_LETTERHEAD.addressLines.join(", ")}</p>
        </div>
        <div className="text-xs text-gray-500 sm:text-right">
          <p>Free phone: {COMPANY_LETTERHEAD.freePhone}</p>
          <p>Mobile: {COMPANY_LETTERHEAD.mobile}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="agentName">Agent</label>
          <input id="agentName" className={inputClass} value={draft.agentName} onChange={(e) => set("agentName", e.target.value)} />
        </div>

        <section className={sectionClass}>
          <h2 className={sectionHeadingClass}>Customer</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="customerName">Customer Name</label>
              <input id="customerName" className={inputClass} value={draft.customerName} onChange={(e) => set("customerName", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="orderDate">Date</label>
              <input id="orderDate" type="date" className={inputClass} value={draft.orderDate} onChange={(e) => set("orderDate", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="customerAddress">Customer Address</label>
              <textarea id="customerAddress" rows={2} className={inputClass} value={draft.customerAddress} onChange={(e) => set("customerAddress", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="customerPostcode">Post Code</label>
              <input id="customerPostcode" className={inputClass} value={draft.customerPostcode} onChange={(e) => set("customerPostcode", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="customerTel">Tel</label>
              <input id="customerTel" type="tel" className={inputClass} value={draft.customerTel} onChange={(e) => set("customerTel", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="customerMobile">Mobile</label>
              <input id="customerMobile" type="tel" className={inputClass} value={draft.customerMobile} onChange={(e) => set("customerMobile", e.target.value)} />
            </div>
          </div>
        </section>
      </div>

      <section className={sectionClass}>
        <h2 className={sectionHeadingClass}>Measurements</h2>
        <MeasurementRowsEditor rows={draft.rows} onChange={(rows) => set("rows", rows)} />
      </section>

      <label className="flex items-center gap-2.5 border-2 border-gray-300 p-3 text-sm font-semibold text-gray-800">
        <input
          type="checkbox"
          className="h-5 w-5 accent-gray-800"
          checked={draft.takeOldBlindsOff}
          onChange={(e) => set("takeOldBlindsOff", e.target.checked)}
        />
        Please Take Old Blinds Off
      </label>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={sectionClass}>
          <h2 className={sectionHeadingClass}>Measurer Signature</h2>
          <SignaturePad value={measurerSignature} onChange={setMeasurerSignature} />
        </section>

        <section className={sectionClass}>
          <h2 className={sectionHeadingClass}>Agreement</h2>
          <div className="text-xs leading-relaxed text-gray-600">
            {AGREEMENT_TEXT.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <p className="text-xs font-semibold text-gray-800">{CUSTOMER_CONFIRMATION_TEXT}</p>
          <span className={labelClass}>Customer Signature</span>
          <SignaturePad value={customerSignature} onChange={setCustomerSignature} />
        </section>
      </div>

      <section className={sectionClass}>
        <h2 className={sectionHeadingClass}>Payment</h2>
        <div className="border-2 border-gray-800 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-800">Bank Details</p>
          <p className="text-sm font-semibold text-gray-900">
            Account Number: {COMPANY_LETTERHEAD.bankDetails.accountNumber} &nbsp; Sort Code:{" "}
            {COMPANY_LETTERHEAD.bankDetails.sortCode}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="depositAmount">Deposit (£)</label>
            <input id="depositAmount" className={inputClass} type="number" step="0.01" inputMode="decimal" value={draft.depositAmount} onChange={(e) => set("depositAmount", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="totalAmount">Total (£)</label>
            <input id="totalAmount" className={inputClass} type="number" step="0.01" inputMode="decimal" value={draft.totalAmount} onChange={(e) => set("totalAmount", e.target.value)} />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5 lg:col-span-1">
            <label className={labelClass} htmlFor="balanceDue">Balance Due (£)</label>
            <input
              id="balanceDue"
              className={inputClass}
              type="number"
              step="0.01"
              inputMode="decimal"
              value={draft.balanceDue}
              onChange={(e) => setDraft((prev) => ({ ...prev, balanceDue: e.target.value, balanceManuallySet: true }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="fittingDate">Fitting Date</label>
            <input id="fittingDate" type="date" className={inputClass} value={draft.fittingDate} onChange={(e) => set("fittingDate", e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Payment Method</span>
          <div className="flex gap-3">
            {(["CARD", "BT", "CASH"] as const).map((method) => {
              const selected = draft.paymentMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => set("paymentMethod", method)}
                  aria-pressed={selected}
                  className={`flex flex-1 items-center justify-center gap-2 border-2 py-2.5 text-sm font-semibold ${
                    selected ? "border-gray-800 bg-gray-800 text-white" : "border-gray-300 text-gray-700"
                  }`}
                >
                  <span className={`flex h-4 w-4 items-center justify-center border ${selected ? "border-white" : "border-gray-500"}`}>
                    {selected && "✓"}
                  </span>
                  {method === "BT" ? "Bank Transfer" : method === "CARD" ? "Card" : "Cash"}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="border-2 border-gray-900 bg-gray-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-gray-700 disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Submit Order"}
      </button>
    </form>
  );
}
