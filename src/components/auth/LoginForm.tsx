"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { PhoneField } from "@/components/forms/PhoneField";
import { errorMessage } from "@/lib/api-error";
import { phoneError, toStoredPhone } from "@/lib/phone";
import { login } from "@/lib/session";
import { emailSchema } from "@/lib/validation";
import { useAuth } from "@/stores/auth";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const status = useAuth((s) => s.status);
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phoneIso, setPhoneIso] = useState("IN");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && !busy) router.replace(next);
  }, [status, busy, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "phone") {
      const message = phoneError(phoneIso, phone);
      if (message) {
        setError(message);
        return;
      }
    }
    if (mode === "email" && !emailSchema.safeParse(email).success) {
      setError("Enter a valid email address");
      return;
    }
    if (!password) {
      setError("Enter your password");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const identifier = mode === "phone" ? toStoredPhone(phoneIso, phone) : email.trim().toLowerCase();
      const customer = await login(identifier, password);
      toast.success(`Welcome back, ${customer.name.split(" ")[0]}`);
      router.replace(next);
    } catch (err) {
      const message = errorMessage(err);
      setError(mode === "phone" && /email/i.test(message) ? "Incorrect mobile number or password" : message);
      setBusy(false);
    }
  };

  const registerHref = `/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <form onSubmit={submit} className="text-center" noValidate>
      <h1 className="text-[19.2px] font-semibold leading-[23px] tracking-[0.72px] text-ink">
        {mode === "phone" ? "Enter Mobile Number" : "Enter Email"}
      </h1>
      <p className="mx-[18px] mb-[15px] mt-2 text-[16px] leading-[28.8px] text-ink">
        {mode === "phone" ? "Sign in with the password linked to this number" : "Sign in with the password on your account"}
      </p>

      {mode === "phone" ? (
        <PhoneField
          variant="login"
          className="mt-[5px] text-left"
          iso={phoneIso}
          national={phone}
          autoFocus
          onChange={({ iso, national }) => {
            setPhoneIso(iso);
            setPhone(national);
            setError(null);
          }}
        />
      ) : (
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          autoComplete="email"
          placeholder="Email Id"
          aria-label="Email"
          autoFocus
          className="mt-[5px] h-14 w-full rounded-[9px] border border-[#a5a5a5] bg-white px-4 text-[16px] text-ink outline-none placeholder:text-[#9a9a9a] focus:border-ink"
        />
      )}

      <div className="relative mt-2.5">
        <input
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Password"
          className="h-14 w-full rounded-[9px] border border-[#a5a5a5] bg-white px-4 pr-12 text-[16px] text-ink outline-none placeholder:text-[#9a9a9a] focus:border-ink"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-[#737373] hover:text-ink"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-left text-[13px] text-danger">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-2.5 flex h-[54px] w-full items-center justify-center gap-2 rounded-[13px] bg-rose text-[16px] text-white transition hover:bg-[#de5f7b] disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
        {!busy && <ArrowRight className="size-[18px]" strokeWidth={1.75} />}
      </button>

      <div className="relative mt-5 mb-2.5">
        <div className="absolute inset-x-0 top-1/2 border-t border-[#d5d5d5]" aria-hidden />
        <p className="relative">
          <span className="bg-white px-[15px] text-[16px] leading-[28.8px] text-ink">Or Login Using</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "phone" ? "email" : "phone"));
          setError(null);
        }}
        className="mx-auto flex h-[51px] w-[200px] items-center justify-center gap-2 rounded-[10px] border border-[#c4c4c4] bg-white text-[16px] text-ink transition hover:border-ink"
      >
        {mode === "phone" ? <Mail className="size-[18px]" strokeWidth={1.75} /> : <Smartphone className="size-[18px]" strokeWidth={1.75} />}
        {mode === "phone" ? "Email" : "Mobile"}
      </button>

      <p className="mt-3 text-[16px] leading-[28.8px]">
        <Link href="/forgot-password" className="text-ink underline underline-offset-2">
          Having trouble logging in.
        </Link>
      </p>
      <p className="text-[16px] leading-[28.8px] text-ink">
        New here?{" "}
        <Link href={registerHref} className="underline underline-offset-2">
          Create an account
        </Link>
      </p>

      <div className="mt-3 text-[12px] leading-[18px] text-ink">
        <p>I accept that I have read &amp; understood</p>
        <p>
          <Link href="/policies/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/policies/terms" className="underline underline-offset-2">
            T&amp;Cs.
          </Link>
        </p>
      </div>
    </form>
  );
}
