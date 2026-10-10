import { pickCity } from "../presentation/input.ts";
import { showError, showSuccess } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { formatCity } from "../utils/format.ts";
import type { State } from "../types/State.ts";

/** Opción 4: eliminar una ciudad guardada (y su default si lo era). */
export async function run(state: State): Promise<void> {
  if (state.cities.length === 0) {
    showError("  No hay ciudades guardadas. Usá la opción 3 para agregar una.");
    return;
  }
  const chosen = await pickCity(state.cities, "  ¿Cuál eliminás? (número, Enter para cancelar): ");
  if (chosen === null) return;
  state.cities = state.cities.filter((c) => c.id !== chosen.id);
  if (state.defaultCityId === chosen.id) state.defaultCityId = null;
  saveCities(state);
  showSuccess(`  ${formatCity(chosen)} eliminada.`);
}
