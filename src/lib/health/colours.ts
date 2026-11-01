export type RiskColour = "grey" | "green" | "yellow" | "orange" | "red" | "badge";

export const COLOUR_RANK: Record<RiskColour, number> = {
  grey: 0,
  green: 1,
  badge: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

export function normalizeColour(raw?: string | null): RiskColour | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (v === "grey" || v === "gray" || v === "none") return "grey";
  if (v === "green") return "green";
  if (v === "yellow") return "yellow";
  if (v === "orange") return "orange";
  if (v === "red") return "red";
  if (v === "badge") return "badge";
  return null;
}

/** Highest risk colour wins. Badge alone does not raise category colour. */
export function maxColour(colours: RiskColour[]): RiskColour {
  if (!colours.length) return "grey";
  const actionable = colours.filter((c) => c !== "badge");
  if (!actionable.length) return colours.includes("badge") ? "green" : "grey";
  return actionable.reduce(
    (a, b) => (COLOUR_RANK[b] > COLOUR_RANK[a] ? b : a),
    "green" as RiskColour
  );
}

export function colourRank(c?: RiskColour | null): number {
  if (!c) return -1;
  return COLOUR_RANK[c];
}

export const PILL_CLASS: Record<RiskColour, string> = {
  green: "c-green",
  yellow: "c-yellow",
  orange: "c-orange",
  red: "c-red",
  grey: "c-none",
  badge: "c-badge",
};

export function combineCategoryColour(
  biomarker: RiskColour,
  genetic: RiskColour
): { colour: RiskColour; geneticBadge: boolean } {
  const geneticBadge = genetic === "badge";
  const geneticForColour: RiskColour = geneticBadge ? "green" : genetic;
  return {
    colour: maxColour([biomarker, geneticForColour]),
    geneticBadge,
  };
}

/** Risk colours — tuned for pine-green dark UI */
export const COLOUR_HEX: Record<RiskColour, string> = {
  grey: "#6c7d78",
  green: "#45c08a",
  yellow: "#e5bd3a",
  orange: "#f08a47",
  red: "#f0626b",
  badge: "#a594ff",
};

/** Soft fills for dark surfaces (was pastel-on-white). */
export const COLOUR_SOFT: Record<RiskColour, string> = {
  grey: "#1c2825",
  green: "#12302a",
  yellow: "#332b0f",
  orange: "#3a2312",
  red: "#3c1a1e",
  badge: "#241f43",
};
