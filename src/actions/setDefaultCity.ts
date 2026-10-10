import { pickCity } from "../presentation/input.ts";
import { showError, showSuccess } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { formatCity } from "../utils/format.ts";
import type { State } from "../types/State.ts";

/** Opción 5: establecer la ciudad default. */
export async function run(state: State): Promise<void> {
  if (state.cities.length === 0) {
    showError("  No hay ciudades guardadas. Usá la opción 3 para agregar una.");
    return;
  }
  const chosen = await pickCity(state.cities, "  ¿Cuál es la nueva default? (número, Enter para cancelar): ");
  if (chosen === null) return;
  state.defaultCityId = chosen.id;
  saveCities(state);
  showSuccess(`  Ciudad default: ${formatCity(chosen)}`);
}
