"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CART_EVENT,
  cartCountFrom,
  hydrateCart,
  readStoredCart,
} from "@/lib/marketplace/cart-storage";

type Notice = {
  id: string;
  title: string;
  body: string;
  when: string;
  href: string;
  unread?: boolean;
};

function demoNotices(locale: "lt" | "en"): Notice[] {
  return locale === "en"
    ? [
        {
          id: "n1",
          title: "New lab results",
          body: "Lipid panel from 2026-05-25 is ready in Labs.",
          when: "2 h",
          href: "/patient/labs",
          unread: true,
        },
        {
          id: "n2",
          title: "Upcoming visit",
          body: "Family doctor follow-up is scheduled — open Visits.",
          when: "Yesterday",
          href: "/patient/visits",
          unread: true,
        },
        {
          id: "n3",
          title: "Prescription reminder",
          body: "Rosuvastatin e-prescription is active in Prescriptions.",
          when: "2 d",
          href: "/patient/prescriptions",
          unread: true,
        },
        {
          id: "n4",
          title: "Health questionnaire",
          body: "You can update answers anytime on the health card.",
          when: "5 d",
          href: "/patient/health-card",
        },
      ]
    : [
        {
          id: "n1",
          title: "Nauji tyrimų rezultatai",
          body: "Lipidų panelė (2026-05-25) jau matoma skiltyje Tyrimai.",
          when: "prieš 2 val.",
          href: "/patient/labs",
          unread: true,
        },
        {
          id: "n2",
          title: "Artėjantis vizitas",
          body: "Šeimos gydytojo kontrolė — atidarykite Vizitai.",
          when: "vakar",
          href: "/patient/visits",
          unread: true,
        },
        {
          id: "n3",
          title: "Recepto priminimas",
          body: "Rozuvastatino e-receptas aktyvus skiltyje Receptai.",
          when: "prieš 2 d.",
          href: "/patient/prescriptions",
          unread: true,
        },
        {
          id: "n4",
          title: "Sveikatos klausimynas",
          body: "Atsakymus galite atnaujinti bet kada sveikatos kortelėje.",
          when: "prieš 5 d.",
          href: "/patient/health-card",
        },
      ];
}

export function TopbarActions({ locale }: { locale: "lt" | "en" }) {
  const [cartCount, setCartCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const notices = useMemo(() => demoNotices(locale), [locale]);
  const unread = notices.filter((n) => n.unread && !readIds.has(n.id)).length;

  useEffect(() => {
    function syncCart() {
      setCartCount(cartCountFrom(hydrateCart(readStoredCart())));
    }
    syncCart();
    window.addEventListener(CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener(CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const copy =
    locale === "en"
      ? {
          notices: "Notifications",
          markAll: "Mark all read",
          empty: "No notifications",
          cart: "Shopping cart",
          openCart: "Open cart",
        }
      : {
          notices: "Pranešimai",
          markAll: "Žymėti visus skaitytais",
          empty: "Pranešimų nėra",
          cart: "Pirkinių krepšelis",
          openCart: "Atidaryti krepšelį",
        };

  return (
    <div className="topbar-actions">
      <div className="topbar-notice" ref={rootRef}>
        <button
          type="button"
          className="topbar-icon-btn"
          aria-label={copy.notices}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
          </svg>
          {unread > 0 ? (
            <span className="topbar-badge danger" aria-hidden="true">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>

        {open ? (
          <div className="topbar-notice-panel" id={panelId} role="dialog">
            <div className="topbar-notice-head">
              <b>{copy.notices}</b>
              {unread > 0 ? (
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={() =>
                    setReadIds(new Set(notices.map((n) => n.id)))
                  }
                >
                  {copy.markAll}
                </button>
              ) : null}
            </div>
            <div className="topbar-notice-list">
              {notices.length ? (
                notices.map((n) => {
                  const isUnread = !!n.unread && !readIds.has(n.id);
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      className={
                        isUnread
                          ? "topbar-notice-item unread"
                          : "topbar-notice-item"
                      }
                      onClick={() => {
                        setReadIds((prev) => new Set(prev).add(n.id));
                        setOpen(false);
                      }}
                    >
                      <span className="topbar-notice-main">
                        <b>{n.title}</b>
                        <em>{n.body}</em>
                      </span>
                      <span className="topbar-notice-when">{n.when}</span>
                    </Link>
                  );
                })
              ) : (
                <div className="topbar-notice-empty">{copy.empty}</div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <Link
        href="/patient/marketplace?cart=1"
        className="topbar-icon-btn"
        aria-label={copy.cart}
        title={copy.openCart}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6" />
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
        </svg>
        {cartCount > 0 ? (
          <span className="topbar-badge accent" aria-hidden="true">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
