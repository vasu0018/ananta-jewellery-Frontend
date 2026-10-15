import type { PublicSettings } from "@/lib/types";

export type FaqGroup = { title: string; items: { q: string; a: string }[] };

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function faqGroups(s: PublicSettings): FaqGroup[] {
  return [
    {
      title: "Orders & payment",
      items: [
        {
          q: "Which payment methods do you accept?",
          a: `UPI, credit and debit cards, net banking and popular wallets through Razorpay${s.checkout.codEnabled ? ", plus cash on delivery on eligible pincodes" : ""}.`,
        },
        {
          q: "Can I check out without an account?",
          a: s.checkout.guestCheckout
            ? "Yes. Guest checkout only needs your email and mobile number. Creating an account later lets you track orders and earn points."
            : "You'll need a free account to place an order — it only takes a minute.",
        },
        {
          q: "Can I cancel my order?",
          a: "Yes, until it's packed. Open the order in My account and choose “Cancel order”. Prepaid orders are refunded to the original payment method within 5–7 business days.",
        },
        {
          q: "My payment failed but money was deducted. What now?",
          a: "Don't worry — failed payments are automatically reversed by your bank within 5–7 business days. You can retry payment from the order page in the meantime.",
        },
      ],
    },
    {
      title: "Shipping & delivery",
      items: [
        {
          q: "How much does shipping cost?",
          a: s.checkout.freeShippingAbove > 0 ? `Shipping is free on orders of ${rupees(s.checkout.freeShippingAbove)} or more. Below that, the fee is shown at checkout.` : "Shipping is free on every order.",
        },
        { q: "How long will delivery take?", a: "We dispatch within 1–2 business days. Delivery usually takes 2–4 business days to metros and 4–7 elsewhere." },
        { q: "How do I track my order?", a: "Use the tracking link in your shipping email, visit My account → Orders, or use our Track order page with your order number." },
      ],
    },
    {
      title: "Returns & exchanges",
      items: [
        { q: "What is your return policy?", a: "Unworn pieces in original packaging can be returned within 30 days of delivery. We'll arrange a free pickup." },
        { q: "Can I exchange a ring for a different size?", a: "Yes — size exchanges on rings and bangles are free within 30 days." },
        { q: "When will I get my refund?", a: "Within 5–7 business days after the returned piece passes our quality check." },
      ],
    },
    {
      title: "Jewellery & care",
      items: [
        { q: "Is your silver genuine?", a: "Every silver piece is certified 925 sterling silver and hallmarked. Lab-grown diamonds come with an IGI certificate." },
        { q: "Will the plating fade?", a: "Our plating is thick and long-lasting, and every plated piece comes with free lifetime re-plating — you only pay for shipping." },
        { q: "How do I care for my jewellery?", a: "Put it on last and take it off first, avoid water and perfume, and store it in the anti-tarnish pouch it came in. A soft cloth keeps it shining." },
        { q: "Is it safe for sensitive skin?", a: "Yes. 925 silver is hypoallergenic and our pieces are nickel- and lead-free." },
      ],
    },
    ...(s.loyalty.enabled
      ? [
          {
            title: "Ananta points",
            items: [
              {
                q: "How do Ananta points work?",
                a: `Earn ${s.loyalty.earnPer100} ${s.loyalty.earnPer100 === 1 ? "point" : "points"} for every ₹100 spent, credited once your order is delivered. Each point is worth ${rupees(s.loyalty.pointValue)} at checkout.`,
              },
              ...(s.loyalty.signupBonus ? [{ q: "Is there a welcome bonus?", a: `Yes — new members get ${s.loyalty.signupBonus} points when they create an account.` }] : []),
            ],
          },
        ]
      : []),
  ];
}
