// Capa de salida: TODO lo que la app imprime al usuario pasa por acá
// (salvo los prompts y el eco simulado, que son de input.ts).
import { cyan, green, red, yellow } from "../utils/colors.ts";
import { formatCity, formatForecastDate, unitSymbol } from "../utils/format.ts";
import type { City } from "../types/City.ts";
import type { DailyForecast, Unit } from "../types/Weather.ts";

/** Mensaje neutro (sin color). */
export function showInfo(message: string): void {
  console.log(message);
}

/** Mensaje de éxito (verde). */
export function showSuccess(message: string): void {
  console.log(green(message));
}

/** Mensaje de error (rojo). */
export function showError(message: string): void {
  console.log(red(message));
}

/** Lista numerada de ciudades. */
export function showCityList(cities: City[]): void {
  cities.forEach((city, i) => console.log(`  ${i + 1}) ${formatCity(city)}`));
}

/** Línea de clima actual: "  Montevideo, ...: 13.4 °C" (temperatura en amarillo). */
export function showWeatherLine(city: City, temp: number, unit: Unit): void {
  console.log(`  ${formatCity(city)}: ${yellow(`${temp} ${unitSymbol(unit)}`)}`);
}

export function showForecastHeader(city: City): void {
  console.log(`  Pronóstico 7 días — ${formatCity(city)}`);
}

/** Fila del pronóstico: "  sáb 10/10   máx 22.1 °C   mín 12.3 °C" (fecha cyan, temps amarillo). */
export function showForecastRow(day: DailyForecast, unit: Unit): void {
  console.log(
    `  ${cyan(formatForecastDate(day.date))}   máx ${yellow(`${day.max} ${unitSymbol(unit)}`)}   mín ${yellow(`${day.min} ${unitSymbol(unit)}`)}`,
  );
}
