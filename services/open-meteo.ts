import type { City, ForecastResponse, GeocodingResponse, Unit } from "../types.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

async function getJson<T>(url: string, what: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error(`No se pudo conectar con OpenMeteo (${what}). Revisá tu conexión.`);
  }
  if (!res.ok) throw new Error(`OpenMeteo respondió HTTP ${res.status} (${what}).`);
  return (await res.json()) as T;
}

/** Busca ciudades por nombre (language=es) y devuelve hasta `count` resultados. */
export async function geocode(name: string, count = 5): Promise<City[]> {
  const params = new URLSearchParams({
    name,
    count: String(count),
    language: "es",
    format: "json",
  });
  const data = await getJson<GeocodingResponse>(`${GEOCODING_URL}?${params}`, "búsqueda de ciudad");
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

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
