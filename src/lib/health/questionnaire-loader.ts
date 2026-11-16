"use server";
import fs from "fs";
import path from "path";
import type { QDefinition, QuestionnaireKind } from "./questionnaire";

export type WomenQDefinition = QDefinition & {
  titleLt?: string;
  titleEn?: string;
  introLt?: string;
  introEn?: string;
};

const cache: Partial<Record<QuestionnaireKind, WomenQDefinition>> = {};

function definitionPath(kind: QuestionnaireKind) {
  return path.join(
    process.cwd(),
    "data",
    "parsed",
    kind === "women"
      ? "women_hormone_questionnaire.json"
      : "health_questionnaire.json"
  );
}

export async function loadQuestionnaireDefinition(
  kind: QuestionnaireKind = "general"
): Promise<WomenQDefinition> {
  const hit = cache[kind];
  if (hit) return hit;
  const raw = fs.readFileSync(definitionPath(kind), "utf8");
  const def = JSON.parse(raw) as WomenQDefinition;
  cache[kind] = def;
  return def;
}
