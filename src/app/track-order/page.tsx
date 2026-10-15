import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { TrackOrder } from "@/components/orders/TrackOrder";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the delivery status of your Ananta Jewellery order with your order number and email or mobile number.",
  alternates: { canonical: "/track-order" },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function TrackOrderPage({ searchParams }: PageProps<"/track-order">) {
  const sp = await searchParams;
  const initial = { order: first(sp.order), contact: first(sp.contact) };
  return (
    <>
      <PageHeader title="Track your order" description="Enter your order number and the email or mobile number you used at checkout." crumbs={[{ label: "Track order" }]} />
      <div className="container-x pb-16">
        <TrackOrder initial={initial} />
      </div>
    </>
  );
}
