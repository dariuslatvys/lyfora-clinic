export type RiskColour = "grey" | "green" | "yellow" | "orange" | "red" | "badge";

const RANK: Record<RiskColour, number> = {
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
  if (v === "grey" || v === "gray") return "grey";
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
  return actionable.reduce((a, b) => (RANK[b] > RANK[a] ? b : a), "green" as RiskColour);
}

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

export const COLOUR_HEX: Record<RiskColour, string> = {
  grey: "#94A3B8",
  green: "#1B7F5A",
  yellow: "#C9A227",
  orange: "#D97706",
  red: "#C23B2E",
  badge: "#5B7C99",
};

export const COLOUR_SOFT: Record<RiskColour, string> = {
  grey: "rgba(148,163,184,0.18)",
  green: "rgba(27,127,90,0.14)",
  yellow: "rgba(201,162,39,0.16)",
  orange: "rgba(217,119,6,0.16)",
  red: "rgba(194,59,46,0.16)",
  badge: "rgba(91,124,153,0.16)",
};
