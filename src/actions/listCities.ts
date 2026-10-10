import { getCurrentWeather } from "../api/weather.ts";
import { showError, showWeatherLine } from "../presentation/output.ts";
import { formatCity } from "../utils/format.ts";
import type { State } from "../types/State.ts";

/** Opción 2: clima actual de todas las ciudades guardadas. */
export async function run(state: State): Promise<void> {
  if (state.cities.length === 0) {
    showError("  No hay ciudades guardadas. Usá la opción 3 para agregar una.");
    return;
  }
  for (const city of state.cities) {
    try {
      const temp = await getCurrentWeather(city.latitude, city.longitude, state.unit);
      showWeatherLine(city, temp, state.unit);
    } catch (err) {
      showError(`  ${formatCity(city)}: ${err instanceof Error ? err.message : "error inesperado"}`);
    }
  }
}
