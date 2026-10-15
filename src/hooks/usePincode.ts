"use client";

import { useSyncExternalStore } from "react";

const KEY = "aj-pincode";
const EVENT = "aj-pincode-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** The shopper's delivery pincode, shared by the header pill and the product page (empty during SSR). */
export function usePincode() {
  return useSyncExternalStore(subscribe, () => localStorage.getItem(KEY) ?? "", () => "");
}

export function savePincode(pin: string) {
  localStorage.setItem(KEY, pin);
  window.dispatchEvent(new Event(EVENT));
}
