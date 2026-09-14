export function OrderPdfLink({ orderId, className }: { orderId: string; className?: string }) {
  return (
    <a
      href={`/api/orders/${orderId}/pdf`}
      className={
        className ??
        "inline-block rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
      }
    >
      Download PDF
    </a>
  );
}
