import type { Metadata } from "next";
import { OrderDetailView } from "@/components/account/OrderDetailView";

export async function generateMetadata({ params }: PageProps<"/account/orders/[orderNumber]">): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${decodeURIComponent(orderNumber)}` };
}

export default async function OrderPage({ params }: PageProps<"/account/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  return <OrderDetailView key={orderNumber} orderNumber={decodeURIComponent(orderNumber)} />;
}
