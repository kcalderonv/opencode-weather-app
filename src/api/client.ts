export const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
export const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

/** GET + JSON con errores de red/HTTP en español (único punto de fetch). */
export async function getJson<T>(url: string, what: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error(`No se pudo conectar con OpenMeteo (${what}). Revisá tu conexión.`);
  }
  if (!res.ok) throw new Error(`OpenMeteo respondió HTTP ${res.status} (${what}).`);
  return (await res.json()) as T;
}
