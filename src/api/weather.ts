import { FORECAST_URL, getJson } from "./client.ts";
import type { DailyForecast, ForecastDailyResponse, ForecastResponse, Unit } from "../types/Weather.ts";

/** Devuelve la temperatura actual para las coordenadas, en la unidad indicada. */
export async function getCurrentWeather(latitude: number, longitude: number, unit: Unit): Promise<number> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m",
    temperature_unit: unit,
  });
  const data = await getJson<ForecastResponse>(`${FORECAST_URL}?${params}`, "clima");
  const temp = data.current?.temperature_2m;
  if (temp === undefined) throw new Error("La respuesta del clima no incluyó la temperatura.");
  return temp;
}

/** Devuelve máx/mín de los próximos 7 días (timezone=auto: días locales de la ciudad). */
export async function getDailyForecast(latitude: number, longitude: number, unit: Unit): Promise<DailyForecast[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: "temperature_2m_max,temperature_2m_min",
    temperature_unit: unit,
    timezone: "auto",
    forecast_days: "7",
  });
  const data = await getJson<ForecastDailyResponse>(`${FORECAST_URL}?${params}`, "pronóstico");
  const daily = data.daily;
  if (daily === undefined) throw new Error("La respuesta del pronóstico no incluyó datos diarios.");
  const times = daily.time ?? [];
  const maxs = daily.temperature_2m_max ?? [];
  const mins = daily.temperature_2m_min ?? [];
  const forecast: DailyForecast[] = [];
  for (let i = 0; i < times.length; i++) {
    const date = times[i];
    const max = maxs[i];
    const min = mins[i];
    if (date === undefined || max === undefined || min === undefined) continue; // respuesta incompleta
    forecast.push({ date, max, min });
  }
  return forecast;
}
