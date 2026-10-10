import { readStateFile, writeStateFile } from "./stateFile.ts";
import type { StateFileResult } from "./stateFile.ts";
import type { Unit } from "../types/Weather.ts";
import type { State } from "../types/State.ts";

/** Carga la unidad configurada (°C por defecto). */
export function loadUnit(raw: StateFileResult): Unit {
  return raw.data?.unit === "fahrenheit" ? "fahrenheit" : "celsius";
}

/** Guarda la unidad: escribe el estado completo para mantener la forma del JSON. */
export function saveUnit(state: State): void {
  writeStateFile(state);
}
