import { getCurrentWeather } from "../api/weather.ts";
import { showError, showWeatherLine } from "../presentation/output.ts";
import type { State } from "../types/State.ts";

/** Opción 1: clima actual de la ciudad default. */
export async function run(state: State): Promise<void> {
  const city = state.cities.find((c) => c.id === state.defaultCityId);
  if (city === undefined) {
    showError("  No hay ciudad default. Usá la opción 5 para establecerla.");
    return;
  }
  const temp = await getCurrentWeather(city.latitude, city.longitude, state.unit);
  showWeatherLine(city, temp, state.unit);
}
