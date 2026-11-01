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

function itemHasDetail(it: MarketItem) {
  return (
    it.kind === "package" ||
    !!it.detailLt ||
    !!it.detailEn ||
    (it.includes && it.includes.length > 0) ||
    (it.genes && it.genes.length > 0)
  );
}

export function MarketplaceView({ locale }: { locale: "lt" | "en" }) {
  const [category, setCategory] = useState<MarketCategory>("consultations");
  const [kind, setKind] = useState<"all" | MarketKind>("all");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

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
            addDetail: "Add to cart",
            remove: "Remove",
            total: "Total",
            order: "Request order",
            ordered: "Order request sent to the clinic desk.",
            genes: "genes",
            empty: "No matching offers in this category.",
            includes: "Includes",
            openDetail: "Details",
            close: "Close",
            geneList: "Gene list",
            markerList: "Tests in this package",
            about: "About",
            hintPkg: "Click a package card to see full contents.",
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
            addDetail: "Įdėti į krepšelį",
            remove: "Šalinti",
            total: "Suma",
            order: "Pateikti užsakymą",
            ordered: "Užsakymo užklausa išsiųsta klinikos registratūrai.",
            genes: "genų",
            empty: "Šioje kategorijoje atitikmenų nerasta.",
            includes: "Apima",
            openDetail: "Detalės",
            close: "Uždaryti",
            geneList: "Genų sąrašas",
            markerList: "Paketo tyrimai",
            about: "Aprašymas",
            hintPkg: "Spauskite paketo kortelę — pamatysite visą sudėtį.",
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
        it.detailLt || "",
        it.detailEn || "",
        it.code || "",
        it.groupLt || "",
        ...(it.includes || []),
        ...(it.genes || []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [category, kind, q]);

  const groupedSingles = useMemo(() => {
    if (category !== "labs" || kind === "package") return null;
    const singles = items.filter((i) => i.kind === "single");
    if (!singles.length) return null;
    const map = new Map<string, MarketItem[]>();
    for (const it of singles) {
      const g = it.groupLt || (locale === "en" ? "Other" : "Kiti");
      const cur = map.get(g) || [];
      cur.push(it);
      map.set(g, cur);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "lt"));
  }, [items, category, kind, locale]);

  const packageItems = useMemo(
    () => items.filter((i) => i.kind === "package"),
    [items]
  );

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

  const detail = detailId
    ? MARKETPLACE_ITEMS.find((i) => i.id === detailId) || null
    : null;

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

  function openDetail(it: MarketItem) {
    if (itemHasDetail(it)) setDetailId(it.id);
  }

  function renderCard(it: MarketItem) {
    const name = locale === "en" ? it.nameEn : it.nameLt;
    const summary = locale === "en" ? it.summaryEn : it.summaryLt;
    const badge = locale === "en" ? it.badgeEn : it.badgeLt;
    const meta = locale === "en" ? it.metaEn : it.metaLt;
    const clickable = itemHasDetail(it);
    return (
      <article
        key={it.id}
        className={`card market-card${clickable ? " market-card-click" : ""}${
          detailId === it.id ? " on" : ""
        }`}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? () => openDetail(it) : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openDetail(it);
                }
              }
            : undefined
        }
      >
        <div className="market-card-top">
          {badge ? <span className="pill plain c-acc">{badge}</span> : <span />}
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
        {meta ? <p className="small muted mt-1 mb-0">{meta}</p> : null}
        {it.includes && it.includes.length && it.kind === "package" ? (
          <p className="small muted mt-2 mb-0">
            <span className="market-includes-label">{copy.includes}: </span>
            {it.includes.slice(0, 4).join(", ")}
            {it.includes.length > 4 ? "…" : ""}
          </p>
        ) : null}
        {it.durationMin ? (
          <p className="small muted mt-2 mb-0">{it.durationMin} min</p>
        ) : null}

        <div className="market-card-foot">
          <p className="market-price m-0">{formatEur(it.priceEur, locale)}</p>
          <div className="row" style={{ gap: 6 }} onClick={(e) => e.stopPropagation()}>
            {clickable ? (
              <button
                type="button"
                className="btn ghost sm"
                onClick={() => openDetail(it)}
              >
                {copy.openDetail}
              </button>
            ) : null}
            <button
              type="button"
              className="btn sm"
              onClick={() => addToCart(it)}
            >
              {copy.add}
            </button>
          </div>
        </div>
      </article>
    );
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
              setDetailId(null);
            }}
          >
            {locale === "en" ? c.en : c.lt}
            <span className="visits-tab-count">{counts[c.id]}</span>
          </button>
        ))}
      </div>

      <p className="small muted m-0">
        {locale === "en" ? catMeta.blurbEn : catMeta.blurbLt}
        {(category === "labs" || category === "genetics") && (
          <> · {copy.hintPkg}</>
        )}
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
              onClick={() => {
                setKind(id);
                setDetailId(null);
              }}
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
        <div className="stack" style={{ gap: 14 }}>
          {packageItems.length && kind !== "single" ? (
            <div>
              {(category === "labs" || category === "genetics") &&
              kind === "all" ? (
                <p className="eyebrow mb-2">{copy.package}</p>
              ) : null}
              <div className="market-grid">{packageItems.map(renderCard)}</div>
            </div>
          ) : null}

          {groupedSingles ? (
            <div className="stack" style={{ gap: 16 }}>
              {kind === "all" && packageItems.length ? (
                <p className="eyebrow mb-0">{copy.single}</p>
              ) : null}
              {groupedSingles.map(([group, rows]) => (
                <section key={group} className="card">
                  <div className="card-head">
                    <h2 className="font-[family-name:var(--font-display)] text-base font-semibold m-0">
                      {group}
                    </h2>
                    <span className="pill plain c-acc">{rows.length}</span>
                  </div>
                  <div className="list mt-2">
                    {rows.map((it) => (
                      <div key={it.id} className="li market-single-li">
                        <div className="grow">
                          <b>{locale === "en" ? it.nameEn : it.nameLt}</b>
                        </div>
                        <b className="num">{formatEur(it.priceEur, locale)}</b>
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => addToCart(it)}
                        >
                          {copy.add}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : kind === "single" ||
            (kind === "all" && !packageItems.length) ||
            category === "consultations" ||
            category === "wellness" ? (
            items.length ? (
              <div className="market-grid">
                {items
                  .filter((i) =>
                    kind === "all" &&
                    (category === "labs" || category === "genetics")
                      ? i.kind !== "package"
                      : true
                  )
                  .map(renderCard)}
              </div>
            ) : (
              <div className="card empty">{copy.empty}</div>
            )
          ) : !packageItems.length ? (
            <div className="card empty">{copy.empty}</div>
          ) : null}
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
              <button
                type="button"
                className="btn mt-3 w-full"
                onClick={placeOrder}
              >
                {copy.order}
              </button>
            </>
          ) : (
            <div className="empty mt-3">{copy.emptyCart}</div>
          )}
        </aside>
      </div>

      {detail ? (
        <div
          className="market-detail-backdrop"
          role="presentation"
          onClick={() => setDetailId(null)}
        >
          <aside
            className="card market-detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="market-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="row between" style={{ gap: 10, alignItems: "flex-start" }}>
              <div>
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  {(locale === "en" ? detail.badgeEn : detail.badgeLt) ? (
                    <span className="pill plain c-acc">
                      {locale === "en" ? detail.badgeEn : detail.badgeLt}
                    </span>
                  ) : null}
                  {detail.code ? (
                    <span className="mono small muted">{detail.code}</span>
                  ) : null}
                </div>
                <h2
                  id="market-detail-title"
                  className="font-[family-name:var(--font-display)] text-2xl font-semibold m-0 mt-2"
                >
                  {locale === "en" ? detail.nameEn : detail.nameLt}
                </h2>
                <p className="market-price m-0 mt-2">
                  {formatEur(detail.priceEur, locale)}
                </p>
              </div>
              <button
                type="button"
                className="btn ghost sm"
                onClick={() => setDetailId(null)}
              >
                {copy.close}
              </button>
            </div>

            <p className="mt-3 mb-0 text-[var(--ink-soft)]">
              {locale === "en" ? detail.summaryEn : detail.summaryLt}
            </p>

            {(locale === "en" ? detail.detailEn : detail.detailLt) ? (
              <div className="mt-4">
                <p className="eyebrow mb-1">{copy.about}</p>
                <p className="m-0 leading-relaxed">
                  {locale === "en" ? detail.detailEn : detail.detailLt}
                </p>
              </div>
            ) : null}

            {detail.geneCount != null ? (
              <p className="small mt-3 mb-0">
                <b>{detail.geneCount}</b> {copy.genes}
                {detail.durationMin ? ` · ${detail.durationMin} min` : ""}
              </p>
            ) : null}

            {detail.genes && detail.genes.length ? (
              <div className="mt-4">
                <p className="eyebrow mb-2">{copy.geneList}</p>
                <div className="market-gene-chips">
                  {detail.genes.map((g) => (
                    <span key={g} className="market-gene-chip">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {detail.includes && detail.includes.length ? (
              <div className="mt-4">
                <p className="eyebrow mb-2">
                  {detail.category === "labs"
                    ? copy.markerList
                    : copy.includes}
                  <span className="pill plain c-acc" style={{ marginLeft: 8 }}>
                    {detail.includes.length}
                  </span>
                </p>
                <ul className="market-detail-list">
                  {detail.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="row mt-5" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  addToCart(detail);
                  setDetailId(null);
                }}
              >
                {copy.addDetail}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setDetailId(null)}
              >
                {copy.close}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
