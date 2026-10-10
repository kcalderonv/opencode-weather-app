import type { City } from "../types/City.ts";
import type { Unit } from "../types/Weather.ts";
import { WEEKDAYS } from "./constants.ts";

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatCity(city: City): string {
  const parts = [city.name, city.admin1, city.country].filter(
    (part): part is string => part !== undefined && part !== "",
  );
  return parts.join(", ");
}

// "2026-10-10" -> "sáb 10/10". Se construye por partes porque new Date(iso)
// interpretaría la fecha en UTC y podría correr el día según la zona horaria
// de quien corre la app.
export function formatForecastDate(date: string): string {
  const [year, month, day] = date.split("-");
  if (year === undefined || month === undefined || day === undefined) return date;
  const weekday = WEEKDAYS[new Date(Number(year), Number(month) - 1, Number(day)).getDay()];
  return `${weekday ?? date} ${day}/${month}`;
}
