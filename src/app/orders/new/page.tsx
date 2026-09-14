import Link from "next/link";
import OrderForm from "./OrderForm";

export default function NewOrderPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-2 py-6 sm:px-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex justify-end">
          <Link
            href="/orders"
            className="rounded-full border-2 border-gray-800 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-800 hover:text-white"
          >
            View All Orders
          </Link>
        </div>
        <OrderForm />
      </div>
    </main>
  );
}
