import { getDailyForecast } from "../api/weather.ts";
import { pickCity } from "../presentation/input.ts";
import { showError, showForecastHeader, showForecastRow } from "../presentation/output.ts";
import type { State } from "../types/State.ts";

/** Opción 6: pronóstico de máx/mín de los próximos 7 días de una ciudad elegida. */
export async function run(state: State): Promise<void> {
  if (state.cities.length === 0) {
    showError("  No hay ciudades guardadas. Usá la opción 3 para agregar una.");
    return;
  }
  const chosen = await pickCity(state.cities, "  ¿De qué ciudad querés el pronóstico? (número, Enter para cancelar): ");
  if (chosen === null) return;
  const forecast = await getDailyForecast(chosen.latitude, chosen.longitude, state.unit);
  showForecastHeader(chosen);
  for (const day of forecast) {
    showForecastRow(day, state.unit);
  }
}
