"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import {
  formatSyncWhen,
  integrationSlugForName,
  isConnectedIntegrationName,
  INTEGRATION_DEMOS,
} from "@/lib/health/integrations-demo";

type IntegrationGroup = {
  id: string;
  title: string;
  items: string[];
};

const GROUPS: IntegrationGroup[] = [
  {
    id: "health-apps",
    title: "Your health apps",
    items: ["Apple Health", "Google Fit", "Samsung Health", "Huawei Health"],
  },
  {
    id: "watches",
    title: "Your watches, bands and rings",
    items: [
      "Garmin",
      "Fitbit",
      "Polar",
      "Suunto",
      "Withings",
      "OURA",
      "Whoop",
      "COROS",
      "Xiaomi",
    ],
  },
  {
    id: "sports",
    title: "Your sports apps",
    items: [
      "Strava",
      "Peloton",
      "Zwift",
      "Nike Run Club",
      "adidas Running",
      "Under Armour",
      "Runkeeper",
      "Komoot",
      "AllTrails",
      "Decathlon",
    ],
  },
  {
    id: "devices",
    title: "Your health devices",
    items: ["OMRON", "beurer", "iHealth"],
  },
  {
    id: "sleep",
    title: "Your Sleep",
    items: ["Eight Sleep", "TEMPUR"],
  },
  {
    id: "nutrition",
    title: "Your nutrition",
    items: ["myfitnesspal", "cronometer", "FatSecret"],
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export function IntegrationsView({
  labels,
  locale,
}: {
  labels: Dictionary;
  locale: "lt" | "en";
}) {
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setConnected((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="stack" style={{ gap: 22 }}>
      <header>
        <p className="eyebrow">
          {locale === "en" ? "Connected data" : "Prijungti duomenys"}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em]">
          {labels.integrations}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          {labels.integrationsBlurb}
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.id} className="integ-section">
          <h2 className="integ-title">{group.title}</h2>
          <div className="integ-grid">
            {group.items.map((name) => {
              const key = `${group.id}:${name}`;
              const demoSlug = integrationSlugForName(name);
              const demoConnected = isConnectedIntegrationName(name);
              const on = demoConnected || !!connected[key];
              const demo = demoSlug ? INTEGRATION_DEMOS[demoSlug] : null;

              return (
                <div key={key} className={`integ-row${on ? " on" : ""}`}>
                  <span className="integ-av" aria-hidden="true">
                    {initials(name)}
                  </span>
                  <div className="integ-name-wrap">
                    <span className="integ-name">{name}</span>
                    {demoConnected && demo ? (
                      <span className="integ-sync">
                        {locale === "en" ? "Synced" : "Sinchronizuota"}{" "}
                        {formatSyncWhen(demo.syncedAt, locale)}
                      </span>
                    ) : null}
                  </div>
                  {demoConnected && demoSlug ? (
                    <Link
                      href={`/patient/integrations/${demoSlug}`}
                      className="btn ghost sm"
                    >
                      {locale === "en" ? "View data" : "Peržiūrėti duomenis"}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={on ? "btn ghost sm" : "btn sm"}
                      onClick={() => toggle(key)}
                      aria-pressed={on}
                    >
                      {on ? labels.connected : labels.connect}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
