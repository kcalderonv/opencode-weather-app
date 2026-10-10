import { geocode } from "../api/geocoding.ts";
import { ask, pickCity } from "../presentation/input.ts";
import { showError, showInfo, showSuccess } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { formatCity } from "../utils/format.ts";
import type { State } from "../types/State.ts";

/** Opción 3: buscar una ciudad por nombre y agregarla a la lista. */
export async function run(state: State): Promise<void> {
  const name = await ask("  Nombre de la ciudad: ");
  if (name === null || name === "") {
    showError("  No ingresaste ningún nombre.");
    return;
  }
  const results = await geocode(name);
  if (results.length === 0) {
    showError(`  No se encontró ninguna ciudad llamada "${name}".`);
    return;
  }
  showInfo("  Resultados:");
  const chosen = await pickCity(results, "  Elegí la ciudad a agregar (número, Enter para cancelar): ");
  if (chosen === null) return;
  if (state.cities.some((c) => c.id === chosen.id)) {
    showError(`  ${formatCity(chosen)} ya está guardada.`);
    return;
  }
  state.cities.push(chosen);
  saveCities(state);
  showSuccess(`  ${formatCity(chosen)} agregada.`);
}
