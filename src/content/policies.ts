import type { PublicSettings } from "@/lib/types";

export type Section = { heading: string; paragraphs?: string[]; bullets?: string[] };
export type Policy = { slug: string; title: string; summary: string; updated: string; sections: (s: PublicSettings) => Section[] };

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const POLICIES: Policy[] = [
  {
    slug: "shipping",
    title: "Shipping policy",
    summary: "Where we ship, how long it takes and what it costs.",
    updated: "2026-10-01",
    sections: (s) => [
      {
        heading: "Delivery across India",
        paragraphs: [
          "We ship across India through trusted courier partners. Enter your pincode on any product page to see whether it's serviceable and when it should arrive.",
        ],
      },
      {
        heading: "Shipping charges",
        bullets: [
          s.checkout.freeShippingAbove > 0
            ? `Standard shipping is free on orders of ${rupees(s.checkout.freeShippingAbove)} or more.`
            : "Standard shipping is free on every order.",
          "Below that, a flat shipping fee is shown at checkout before you pay. Express delivery is available on select pincodes.",
          s.checkout.codEnabled
            ? `Cash on delivery is available on eligible pincodes${s.checkout.codFee ? ` for a ${rupees(s.checkout.codFee)} handling fee` : ""}.`
            : "Cash on delivery is currently unavailable; all orders are prepaid.",
        ],
      },
      {
        heading: "Dispatch & delivery times",
        bullets: [
          "Orders are packed and dispatched within 1–2 business days.",
          "Metro cities usually receive orders in 2–4 business days; other locations in 4–7 business days.",
          "You'll get an email and SMS with the tracking link as soon as your order ships.",
        ],
      },
      {
        heading: "Packaging",
        paragraphs: [
          "Every piece arrives in our signature box with an anti-tarnish pouch, care card and authenticity certificate where applicable. Gift wrapping with a handwritten note can be added at checkout.",
        ],
      },
      {
        heading: "Delays & failed deliveries",
        paragraphs: [
          "Weather, festivals and courier disruptions can occasionally delay delivery. If a delivery attempt fails, the courier will try again up to two more times before returning the parcel to us. Contact us and we'll arrange a re-shipment.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns & exchanges",
    summary: "30-day easy returns, free size exchanges and lifetime plating.",
    updated: "2026-10-01",
    sections: () => [
      {
        heading: "30-day returns",
        paragraphs: [
          "Not in love with your piece? Return it within 30 days of delivery for a full refund. Items must be unworn, in their original packaging with tags and certificates.",
        ],
      },
      {
        heading: "How to request a return",
        bullets: [
          "Go to My account → Orders, open the order and choose “Return”. Guests can contact us with their order number.",
          "We'll schedule a free pickup within 48 hours.",
          "Once the piece passes our quality check, the refund is issued within 5–7 business days.",
        ],
      },
      {
        heading: "Refunds",
        bullets: [
          "Prepaid orders are refunded to the original payment method.",
          "Cash-on-delivery orders are refunded by bank transfer (we'll ask for your account details) or as store credit, whichever you prefer.",
          "Shipping, COD and gift-wrap fees are non-refundable unless the item arrived damaged or incorrect.",
        ],
      },
      {
        heading: "Exceptions",
        bullets: [
          "Personalised or engraved pieces can't be returned unless they arrive damaged or incorrect.",
          "Items bought during clearance sales are eligible for exchange only.",
        ],
      },
      {
        heading: "Size exchanges & lifetime plating",
        paragraphs: [
          "Rings and bangles can be exchanged for a different size free of charge within 30 days. Every plated piece also comes with lifetime re-plating — just send it back and we'll restore the shine; you only pay for shipping.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    summary: "What we collect, why we collect it and how we protect it.",
    updated: "2026-10-01",
    sections: (s) => [
      {
        heading: "Information we collect",
        bullets: [
          "Account and order details: name, email, mobile number and delivery addresses.",
          "Payment details are handled by our payment partner (Razorpay). We never see or store your full card number, UPI PIN or banking passwords.",
          "Usage data such as pages visited and items viewed, collected in aggregate to improve the store.",
        ],
      },
      {
        heading: "How we use it",
        bullets: [
          "To process, deliver and support your orders, returns and refunds.",
          "To send order updates by email, SMS or WhatsApp.",
          "To send offers and new arrivals — only if you've opted in. You can unsubscribe at any time.",
          "To prevent fraud and keep your account secure.",
        ],
      },
      {
        heading: "Sharing",
        paragraphs: [
          "We share only what's needed with courier, payment and messaging partners to fulfil your order. We never sell your personal data.",
        ],
      },
      {
        heading: "Cookies & local storage",
        paragraphs: [
          "We use a secure cookie to keep you signed in and your browser's local storage to remember your bag, wishlist and recently viewed items. We don't use third-party advertising cookies.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          `You can view and update your details from My account, or email ${s.store.email} to request a copy or deletion of your data. We'll respond within 30 days.`,
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of service",
    summary: "The terms that apply when you shop with us.",
    updated: "2026-10-01",
    sections: (s) => [
      {
        heading: "About these terms",
        paragraphs: [
          `These terms apply to purchases made on this website, operated by ${s.store.name}${s.store.city ? `, ${s.store.city}, ${s.store.state}` : ""}. By placing an order you agree to them.`,
        ],
      },
      {
        heading: "Products & pricing",
        bullets: [
          "All prices are in Indian Rupees and include GST.",
          "We take care to display colours and finishes accurately, but they may vary slightly depending on your screen.",
          "Handcrafted pieces can have minor variations in size and weight — that's part of their charm.",
          "If an item is priced incorrectly due to an error, we'll contact you before dispatch and you may cancel for a full refund.",
        ],
      },
      {
        heading: "Orders",
        bullets: [
          "An order is confirmed once payment succeeds (or, for cash on delivery, once we've verified it).",
          "You can cancel an order from My account until it is packed. Paid orders are refunded in full.",
          "We may cancel orders that look fraudulent or that we're unable to fulfil, with a full refund.",
        ],
      },
      {
        heading: "Offers & loyalty points",
        bullets: [
          "Coupons can't be combined unless stated and may have minimum order values or other conditions.",
          s.loyalty.enabled
            ? `Ananta points have no cash value. Each point is worth ${rupees(s.loyalty.pointValue)} off a future order and can be withdrawn if the related order is cancelled or returned.`
            : "Loyalty benefits, when offered, have no cash value.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [`Questions about these terms? Write to us at ${s.store.email} or call ${s.store.phone}.`],
      },
    ],
  },
];

export const getPolicy = (slug: string) => POLICIES.find((p) => p.slug === slug);
