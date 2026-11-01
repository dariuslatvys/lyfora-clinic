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

/** Risk colours from Lyfora Klinika.html example */
export const COLOUR_HEX: Record<RiskColour, string> = {
  grey: "#a2b0ab",
  green: "#23885a",
  yellow: "#c99700",
  orange: "#dc6214",
  red: "#c42f3a",
  badge: "#6b55c9",
};

export const COLOUR_SOFT: Record<RiskColour, string> = {
  grey: "#eef1f0",
  green: "#e1f3ea",
  yellow: "#fbf2d3",
  orange: "#fde8da",
  red: "#fbe1e3",
  badge: "#ece8fa",
};
