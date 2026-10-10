import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { State } from "../types/State.ts";

// Estado persistente en un JSON local (directorio desde donde se ejecuta la app).
export const STATE_FILE = "weather-cli.json";

export interface StateFileResult {
  exists: boolean;
  corrupted: boolean;
  data: Partial<State> | null;
}

/** Lee el JSON crudo. No loguea: el aviso de corrupto lo emite `index.ts`. */
export function readStateFile(): StateFileResult {
  if (!existsSync(STATE_FILE)) return { exists: false, corrupted: false, data: null };
  try {
    const parsed = JSON.parse(readFileSync(STATE_FILE, "utf8")) as unknown;
    const data = typeof parsed === "object" && parsed !== null ? (parsed as Partial<State>) : null;
    return { exists: true, corrupted: false, data };
  } catch {
    return { exists: true, corrupted: true, data: null };
  }
}

/** Escribe el estado completo (misma forma del JSON desde la primera versión). */
export function writeStateFile(state: State): void {
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
