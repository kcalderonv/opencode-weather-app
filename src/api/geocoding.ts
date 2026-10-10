import { GEOCODING_URL, getJson } from "./client.ts";
import type { City, GeocodingResponse } from "../types/City.ts";

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
