import type { Metadata } from "next";
import { OrdersList } from "@/components/account/OrdersList";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage({ searchParams }: PageProps<"/account/orders">) {
  const { page } = await searchParams;
  const n = Number(Array.isArray(page) ? page[0] : page);
  return <OrdersList page={Number.isInteger(n) && n > 0 ? n : 1} />;
}
