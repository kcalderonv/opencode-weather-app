import { showSuccess } from "../presentation/output.ts";
import { saveUnit } from "../storage/settingsStorage.ts";
import { unitSymbol } from "../utils/format.ts";
import type { State } from "../types/State.ts";

/** Opción 8: alternar la unidad de temperatura (°C ↔ °F). */
export async function run(state: State): Promise<void> {
  state.unit = state.unit === "celsius" ? "fahrenheit" : "celsius";
  saveUnit(state);
  showSuccess(`  Unidad establecida: ${unitSymbol(state.unit)}`);
}
