"use client";

import { useMemo, useState } from "react";
import {
  MARKET_CATEGORIES,
  MARKETPLACE_ITEMS,
  formatEur,
  type MarketCategory,
  type MarketItem,
  type MarketKind,
} from "@/lib/marketplace/catalog";

type CartLine = { item: MarketItem; qty: number };

export function MarketplaceView({ locale }: { locale: "lt" | "en" }) {
  const [category, setCategory] = useState<MarketCategory>("consultations");
  const [kind, setKind] = useState<"all" | MarketKind>("all");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            eyebrow: "Clinic shop",
            title: "Marketplace",
            blurb:
              "Book consultations, lab and genetics tests (singles or packages), and wellness services — massage, SPA, dietitian.",
            search: "Search services…",
            all: "All",
            single: "Single",
            package: "Packages",
            cart: "Cart",
            emptyCart: "Cart is empty",
            add: "Add",
            remove: "Remove",
            total: "Total",
            order: "Request order",
            ordered: "Order request sent to the clinic desk.",
            genes: "genes",
            fromFile: "Source list",
            clinicPrice: "Clinic price",
            empty: "No matching offers in this category.",
            includes: "Includes",
          }
        : {
            eyebrow: "Klinikos parduotuvė",
            title: "Marketplace",
            blurb:
              "Konsultacijos, laboratoriniai ir genetiniai tyrimai (vienetiniai ar paketai) bei sveikatingumas — masažai, SPA, dietologas.",
            search: "Ieškoti paslaugų…",
            all: "Visi",
            single: "Vienetiniai",
            package: "Paketai",
            cart: "Krepšelis",
            emptyCart: "Krepšelis tuščias",
            add: "Į krepšelį",
            remove: "Šalinti",
            total: "Suma",
            order: "Pateikti užsakymą",
            ordered: "Užsakymo užklausa išsiųsta klinikos registratūrai.",
            genes: "genų",
            fromFile: "Šaltinio kaina",
            clinicPrice: "Klinikos kaina",
            empty: "Šioje kategorijoje atitikmenų nerasta.",
            includes: "Apima",
          },
    [locale]
  );

  const catMeta = MARKET_CATEGORIES.find((c) => c.id === category)!;

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MARKETPLACE_ITEMS.filter((it) => {
      if (it.category !== category) return false;
      if (kind !== "all" && it.kind !== kind) return false;
      if (!query) return true;
      const hay = [
        it.nameLt,
        it.nameEn,
        it.summaryLt,
        it.summaryEn,
        it.code || "",
        ...(it.includes || []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [category, kind, q]);

  const counts = useMemo(() => {
    const map: Record<MarketCategory, number> = {
      consultations: 0,
      labs: 0,
      genetics: 0,
      wellness: 0,
    };
    for (const it of MARKETPLACE_ITEMS) map[it.category] += 1;
    return map;
  }, []);

  const cartTotal = cart.reduce((s, l) => s + l.item.priceEur * l.qty, 0);
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  function addToCart(item: MarketItem) {
    setCart((prev) => {
      const hit = prev.find((l) => l.item.id === item.id);
      if (hit) {
        return prev.map((l) =>
          l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [...prev, { item, qty: 1 }];
    });
    setFlash(null);
  }

  function removeLine(id: string) {
    setCart((prev) => prev.filter((l) => l.item.id !== id));
  }

  function placeOrder() {
    if (!cart.length) return;
    setCart([]);
    setFlash(copy.ordered);
  }

  return (
    <div className="stack market-page" style={{ gap: 16 }}>
      <header>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] m-0">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] mb-0">
          {copy.blurb}
        </p>
      </header>

      <div
        className="tabs visits-tabs market-cats"
        role="tablist"
        aria-label={copy.title}
      >
        {MARKET_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            className={category === c.id ? "on" : undefined}
            aria-selected={category === c.id}
            onClick={() => {
              setCategory(c.id);
              setKind("all");
              setQ("");
            }}
          >
            {locale === "en" ? c.en : c.lt}
            <span className="visits-tab-count">{counts[c.id]}</span>
          </button>
        ))}
      </div>

      <p className="small muted m-0">
        {locale === "en" ? catMeta.blurbEn : catMeta.blurbLt}
      </p>

      <div className="market-toolbar">
        <div className="upload-filter">
          {(
            [
              ["all", copy.all],
              ["single", copy.single],
              ["package", copy.package],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`upload-filter-btn${kind === id ? " on" : ""}`}
              onClick={() => setKind(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          className="market-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy.search}
          aria-label={copy.search}
        />
      </div>

      <div className="market-layout">
        <div className="market-grid">
          {items.length ? (
            items.map((it) => {
              const name = locale === "en" ? it.nameEn : it.nameLt;
              const summary = locale === "en" ? it.summaryEn : it.summaryLt;
              const badge = locale === "en" ? it.badgeEn : it.badgeLt;
              const meta = locale === "en" ? it.metaEn : it.metaLt;
              return (
                <article key={it.id} className="card market-card">
                  <div className="market-card-top">
                    {badge ? (
                      <span className="pill plain c-acc">{badge}</span>
                    ) : (
                      <span />
                    )}
                    {it.code ? (
                      <span className="mono small muted">{it.code}</span>
                    ) : null}
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0 mt-2">
                    {name}
                  </h3>
                  <p className="small muted mt-2 mb-0">{summary}</p>
                  {it.geneCount != null ? (
                    <p className="small mt-2 mb-0">
                      <b>{it.geneCount}</b> {copy.genes}
                    </p>
                  ) : null}
                  {meta ? (
                    <p className="small muted mt-1 mb-0">{meta}</p>
                  ) : null}
                  {it.includes && it.includes.length ? (
                    <p className="small muted mt-2 mb-0">
                      <span className="market-includes-label">
                        {copy.includes}:{" "}
                      </span>
                      {it.includes.slice(0, 6).join(", ")}
                      {it.includes.length > 6 ? "…" : ""}
                    </p>
                  ) : null}
                  {it.durationMin ? (
                    <p className="small muted mt-2 mb-0">
                      {it.durationMin} min
                    </p>
                  ) : null}

                  <div className="market-card-foot">
                    <div>
                      <p className="market-price m-0">
                        {formatEur(it.priceEur, locale)}
                      </p>
                      {it.basePriceEur != null ? (
                        <p className="small muted m-0">
                          {copy.fromFile}{" "}
                          <s>{formatEur(it.basePriceEur, locale)}</s>
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => addToCart(it)}
                    >
                      {copy.add}
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="card empty">{copy.empty}</div>
          )}
        </div>

        <aside className="card market-cart">
          <div className="card-head">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
              {copy.cart}
            </h2>
            <span className="pill plain c-acc">{cartCount}</span>
          </div>
          {flash ? (
            <p className="small mt-2 mb-0 text-[var(--accent)]">{flash}</p>
          ) : null}
          {cart.length ? (
            <>
              <div className="list mt-3">
                {cart.map((l) => (
                  <div key={l.item.id} className="li market-cart-line">
                    <div className="grow">
                      <b>
                        {locale === "en" ? l.item.nameEn : l.item.nameLt}
                      </b>
                      <span className="small muted">
                        {l.qty} × {formatEur(l.item.priceEur, locale)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn ghost sm"
                      onClick={() => removeLine(l.item.id)}
                    >
                      {copy.remove}
                    </button>
                  </div>
                ))}
              </div>
              <div className="market-cart-total">
                <span>{copy.total}</span>
                <b>{formatEur(cartTotal, locale)}</b>
              </div>
              <button type="button" className="btn mt-3 w-full" onClick={placeOrder}>
                {copy.order}
              </button>
            </>
          ) : (
            <div className="empty mt-3">{copy.emptyCart}</div>
          )}
        </aside>
      </div>
    </div>
  );
}
