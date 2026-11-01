"use server";
import fs from "fs";
import path from "path";
import type { QDefinition } from "./questionnaire";

let _def: QDefinition | null = null;

export async function loadQuestionnaireDefinition(): Promise<QDefinition> {
  if (_def) return _def;
  const p = path.join(
    process.cwd(),
    "data",
    "parsed",
    "health_questionnaire.json"
  );
  _def = JSON.parse(fs.readFileSync(p, "utf8")) as QDefinition;
  return _def;
}
