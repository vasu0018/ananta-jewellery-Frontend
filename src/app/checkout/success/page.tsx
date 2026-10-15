import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrderSuccess } from "@/components/checkout/OrderSuccess";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const sp = await searchParams;
  const order = typeof sp.order === "string" ? sp.order.trim().toUpperCase() : "";
  if (!order) redirect("/");
  const payment = typeof sp.payment === "string" ? sp.payment : undefined;
  return (
    <div className="container-x py-12 sm:py-16">
      <OrderSuccess key={order} orderNumber={order} payment={payment} />
    </div>
  );
}
