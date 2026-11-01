import { getMarketItem, type MarketItem } from "@/lib/marketplace/catalog";

export type StoredCartLine = { id: string; qty: number };
export type CartLine = { item: MarketItem; qty: number };

export const CART_STORAGE_KEY = "lyfora.patient.cart.v1";
export const CART_EVENT = "lyfora-cart-changed";

/** Demo starter line so the topbar cart badge is visible on first visit. */
const DEMO_SEED: StoredCartLine[] = [{ id: "lab-pkg-cardiovascular-core", qty: 1 }];

export function readStoredCart(): StoredCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (raw == null) {
      // First visit — seed one demo package (matches topbar badge mock).
      writeStoredCart(DEMO_SEED);
      return DEMO_SEED.map((l) => ({ ...l }));
    }
    const parsed = JSON.parse(raw) as StoredCartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l) => l && typeof l.id === "string" && Number(l.qty) > 0)
      .map((l) => ({ id: l.id, qty: Math.min(99, Math.floor(Number(l.qty) || 1)) }));
  } catch {
    return [];
  }
}

export function writeStoredCart(lines: StoredCartLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function hydrateCart(lines: StoredCartLine[] = readStoredCart()): CartLine[] {
  const out: CartLine[] = [];
  for (const l of lines) {
    const item = getMarketItem(l.id);
    if (!item) continue;
    out.push({ item, qty: l.qty });
  }
  return out;
}

export function cartCountFrom(lines: CartLine[] | StoredCartLine[]) {
  return lines.reduce((s, l) => s + (l.qty || 0), 0);
}

export function persistCartLines(lines: CartLine[]) {
  writeStoredCart(lines.map((l) => ({ id: l.item.id, qty: l.qty })));
}
