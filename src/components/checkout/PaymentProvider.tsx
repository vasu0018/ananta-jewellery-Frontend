"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CreditCard, Landmark, Lock, Smartphone, Wallet } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-error";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RazorpayPayload } from "@/lib/types";

export type PaymentResult = { status: "paid" } | { status: "dismissed" } | { status: "failed"; message: string };

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: "payment.failed", cb: (r: { error: { code?: string; description?: string } }) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise: Promise<void> | null = null;

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Couldn't load the payment window. Check your connection and try again."));
    };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

async function verify(body: RazorpayResponse & { method?: string }): Promise<PaymentResult> {
  try {
    await api("/checkout/razorpay/verify", { body });
    return { status: "paid" };
  } catch (e) {
    return { status: "failed", message: errorMessage(e) };
  }
}

const reportFailure = (orderId: string, code?: string, description?: string) =>
  api("/checkout/razorpay/failed", { body: { razorpay_order_id: orderId, code, description } }).catch(() => undefined);

type Ctx = (payload: RazorpayPayload) => Promise<PaymentResult>;
const PaymentContext = createContext<Ctx | null>(null);

/** Opens Razorpay Checkout (or the dev mock when the API has no keys) and verifies the payment. */
export function usePayment() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error("usePayment must be used inside <PaymentProvider>");
  return ctx;
}

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [mock, setMock] = useState<RazorpayPayload | null>(null);
  const resolver = useRef<((r: PaymentResult) => void) | null>(null);

  const settle = useCallback((r: PaymentResult) => {
    resolver.current?.(r);
    resolver.current = null;
    setMock(null);
  }, []);

  const pay = useCallback<Ctx>(async (payload) => {
    if (payload.mock) {
      return new Promise<PaymentResult>((resolve) => {
        resolver.current = resolve;
        setMock(payload);
      });
    }
    try {
      await loadRazorpay();
    } catch (e) {
      return { status: "failed", message: errorMessage(e) };
    }
    return new Promise<PaymentResult>((resolve) => {
      let done = false;
      const finish = (r: PaymentResult) => {
        if (done) return;
        done = true;
        resolve(r);
      };
      const rzp = new window.Razorpay!({
        key: payload.keyId,
        order_id: payload.orderId,
        amount: payload.amount,
        currency: payload.currency,
        name: payload.name,
        description: payload.description,
        prefill: payload.prefill,
        theme: { color: "#231f1d" },
        handler: (resp: RazorpayResponse) => void verify(resp).then(finish),
        modal: { ondismiss: () => finish({ status: "dismissed" }), confirm_close: true },
      });
      // Razorpay lets the shopper retry inside the modal, so a failure is only recorded here.
      rzp.on("payment.failed", (r) => void reportFailure(payload.orderId, r.error.code, r.error.description));
      rzp.open();
    });
  }, []);

  return (
    <PaymentContext.Provider value={pay}>
      {children}
      <MockPaymentSheet payload={mock} onSettle={settle} />
    </PaymentContext.Provider>
  );
}

const METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "netbanking", label: "Net banking", icon: Landmark },
  { id: "wallet", label: "Wallet", icon: Wallet },
] as const;

/** Development stand-in for Razorpay Checkout; the API accepts `order_mock_*` ids only outside production. */
function MockPaymentSheet({ payload, onSettle }: { payload: RazorpayPayload | null; onSettle: (r: PaymentResult) => void }) {
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("upi");
  const [busy, setBusy] = useState<"pay" | "fail" | null>(null);

  const succeed = async () => {
    if (!payload) return;
    setBusy("pay");
    const r = await verify({
      razorpay_order_id: payload.orderId,
      razorpay_payment_id: `pay_mock_${Math.random().toString(36).slice(2, 12)}`,
      razorpay_signature: "mock_signature",
      method,
    });
    setBusy(null);
    onSettle(r);
  };

  const fail = async () => {
    if (!payload) return;
    setBusy("fail");
    await reportFailure(payload.orderId, "BAD_REQUEST_ERROR", "Payment declined (test)");
    setBusy(null);
    onSettle({ status: "failed", message: "Your payment was declined. No money was deducted — please try again." });
  };

  return (
    <Sheet
      open={!!payload}
      onOpenChange={(o) => !o && !busy && onSettle({ status: "dismissed" })}
      side="center"
      title="Test payment"
      description={payload ? `${payload.description} · ${payload.name}` : undefined}
      className="sm:max-w-md"
    >
      {payload && (
        <div className="space-y-5 pb-2">
          <p className="rounded-xl bg-gold-soft/50 px-3 py-2 text-xs text-[#7a5b2c]">
            Razorpay keys aren&apos;t configured, so this is a simulated payment. Add keys in Admin → Settings → Payments to take real payments.
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-soft">Amount payable</span>
            <span className="text-2xl font-semibold text-ink">{inr(payload.amount / 100)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Payment method">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={method === m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-3 text-sm transition",
                  method === m.id ? "border-ink bg-cream text-ink" : "border-line text-ink-soft hover:border-line-strong",
                )}
              >
                <m.icon className="size-4" /> {m.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Button block size="lg" onClick={() => void succeed()} loading={busy === "pay"} disabled={!!busy}>
              <Lock className="size-4" /> Pay {inr(payload.amount / 100)}
            </Button>
            <Button block variant="ghost" onClick={() => void fail()} loading={busy === "fail"} disabled={!!busy}>
              Simulate a failed payment
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
