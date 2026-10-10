import * as readline from "node:readline";
import { loadState, saveState } from "./storage.ts";
import { geocode, getCurrentWeather, getDailyForecast } from "./services/open-meteo.ts";
import { bold, cyan, green, red, yellow } from "./colors.ts";
import type { City, State, Unit } from "./types.ts";

const BORDER = "═".repeat(40);
const TITLE = "         WEATHER CLI";

// --- Entrada por consola ----------------------------------------------------
// Nota: no usamos rl.question() de node:readline/promises porque en Bun cuelga
// para siempre al llegar EOF. Con los eventos "line" y "close" el EOF se maneja
// de forma determinística (ask() devuelve null).
// Las líneas se encolan para que también funcione con varias líneas de golpe
// (redirección de archivo o pegado de varias líneas en la terminal).
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const inputLines: string[] = [];
let resolveLine: ((value: string | null) => void) | null = null;
let inputClosed = false;

rl.on("line", (rawLine) => {
  const line = rawLine.trim();
  if (resolveLine !== null) {
    const resolve = resolveLine;
    resolveLine = null;
    resolve(line);
  } else {
    inputLines.push(line);
  }
});

rl.on("close", () => {
  inputClosed = true;
  if (resolveLine !== null) {
    const resolve = resolveLine;
    resolveLine = null;
    resolve(null);
  }
});

const isInteractive = process.stdin.isTTY === true;

/** Escribe el prompt y lee una línea; null si la entrada se cerró (EOF). */
function ask(prompt: string): Promise<string | null> {
  const queued = inputLines.shift();
  if (queued !== undefined) {
    process.stdout.write(prompt);
    if (!isInteractive) console.log(queued); // eco simulado en modo no interactivo
    return Promise.resolve(queued);
  }
  if (inputClosed) return Promise.resolve(null);
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    resolveLine = (value) => {
      if (!isInteractive && value !== null) console.log(value); // eco simulado
      resolve(value);
    };
  });
}

// --- Presentación -----------------------------------------------------------

function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

function formatCity(city: City): string {
  const parts = [city.name, city.admin1, city.country].filter(
    (part): part is string => part !== undefined && part !== "",
  );
  return parts.join(", ");
}

const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"] as const;

// "2026-10-10" -> "sáb 10/10". Se construye por partes porque new Date(iso)
// interpretaría la fecha en UTC y podría correr el día según la zona horaria
// de quien corre la app.
function formatForecastDate(date: string): string {
  const [year, month, day] = date.split("-");
  if (year === undefined || month === undefined || day === undefined) return date;
  const weekday = WEEKDAYS[new Date(Number(year), Number(month) - 1, Number(day)).getDay()];
  return `${weekday ?? date} ${day}/${month}`;
}

function renderMenu(state: State): void {
  const lines = [
    cyan(BORDER),
    bold(cyan(TITLE)),
    cyan(BORDER),
    "  1. Clima de ciudad default",
    `  2. Clima de todas las ciudades (${state.cities.length})`,
    "  3. Buscar y agregar ciudad",
    "  4. Eliminar ciudad",
    "  5. Establecer ciudad default",
    "  6. Pronóstico 7 días",
    `  8. Ajustes (${unitSymbol(state.unit)})`,
    "  9. Salir",
    cyan(BORDER),
  ];
  console.log(lines.join("\n"));
}

function listCities(cities: City[]): void {
  cities.forEach((city, i) => console.log(`  ${i + 1}) ${formatCity(city)}`));
}

async function pickCity(cities: City[], prompt: string): Promise<City | null> {
  listCities(cities);
  const input = await ask(prompt);
  if (input === null || input === "") {
    console.log("  Cancelado.");
    return null;
  }
  const num = Number(input);
  if (!Number.isInteger(num) || num < 1) {
    console.log(red("  Selección inválida."));
    return null;
  }
  const city = cities[num - 1];
  if (city === undefined) {
    console.log(red("  Selección inválida."));
    return null;
  }
  return city;
}

// --- Acciones del menú ------------------------------------------------------

async function showWeather(city: City, unit: Unit): Promise<void> {
  const temp = await getCurrentWeather(city.latitude, city.longitude, unit);
  console.log(`  ${formatCity(city)}: ${yellow(`${temp} ${unitSymbol(unit)}`)}`);
}

async function showDefaultWeather(state: State): Promise<void> {
  const city = state.cities.find((c) => c.id === state.defaultCityId);
  if (city === undefined) {
    console.log(red("  No hay ciudad default. Usá la opción 5 para establecerla."));
    return;
  }
  await showWeather(city, state.unit);
}

async function showAllWeather(state: State): Promise<void> {
  if (state.cities.length === 0) {
    console.log(red("  No hay ciudades guardadas. Usá la opción 3 para agregar una."));
    return;
  }
  for (const city of state.cities) {
    try {
      await showWeather(city, state.unit);
    } catch (err) {
      console.log(red(`  ${formatCity(city)}: ${err instanceof Error ? err.message : "error inesperado"}`));
    }
  }
}

async function searchAndAdd(state: State): Promise<void> {
  const name = await ask("  Nombre de la ciudad: ");
  if (name === null || name === "") {
    console.log(red("  No ingresaste ningún nombre."));
    return;
  }
  const results = await geocode(name);
  if (results.length === 0) {
    console.log(red(`  No se encontró ninguna ciudad llamada "${name}".`));
    return;
  }
  console.log("  Resultados:");
  const chosen = await pickCity(results, "  Elegí la ciudad a agregar (número, Enter para cancelar): ");
  if (chosen === null) return;
  if (state.cities.some((c) => c.id === chosen.id)) {
    console.log(red(`  ${formatCity(chosen)} ya está guardada.`));
    return;
  }
  state.cities.push(chosen);
  saveState(state);
  console.log(green(`  ${formatCity(chosen)} agregada.`));
}

async function removeCity(state: State): Promise<void> {
  if (state.cities.length === 0) {
    console.log(red("  No hay ciudades guardadas. Usá la opción 3 para agregar una."));
    return;
  }
  const chosen = await pickCity(state.cities, "  ¿Cuál eliminás? (número, Enter para cancelar): ");
  if (chosen === null) return;
  state.cities = state.cities.filter((c) => c.id !== chosen.id);
  if (state.defaultCityId === chosen.id) state.defaultCityId = null;
  saveState(state);
  console.log(green(`  ${formatCity(chosen)} eliminada.`));
}

async function setDefaultCity(state: State): Promise<void> {
  if (state.cities.length === 0) {
    console.log(red("  No hay ciudades guardadas. Usá la opción 3 para agregar una."));
    return;
  }
  const chosen = await pickCity(state.cities, "  ¿Cuál es la nueva default? (número, Enter para cancelar): ");
  if (chosen === null) return;
  state.defaultCityId = chosen.id;
  saveState(state);
  console.log(green(`  Ciudad default: ${formatCity(chosen)}`));
}

function toggleUnit(state: State): void {
  state.unit = state.unit === "celsius" ? "fahrenheit" : "celsius";
  saveState(state);
  console.log(green(`  Unidad establecida: ${unitSymbol(state.unit)}`));
}

async function showForecast(state: State): Promise<void> {
  if (state.cities.length === 0) {
    console.log(red("  No hay ciudades guardadas. Usá la opción 3 para agregar una."));
    return;
  }
  const chosen = await pickCity(state.cities, "  ¿De qué ciudad querés el pronóstico? (número, Enter para cancelar): ");
  if (chosen === null) return;
  const forecast = await getDailyForecast(chosen.latitude, chosen.longitude, state.unit);
  console.log(`  Pronóstico 7 días — ${formatCity(chosen)}`);
  const unit = unitSymbol(state.unit);
  for (const day of forecast) {
    console.log(`  ${cyan(formatForecastDate(day.date))}   máx ${yellow(`${day.max} ${unit}`)}   mín ${yellow(`${day.min} ${unit}`)}`);
  }
}

// --- Loop principal ---------------------------------------------------------

async function main(): Promise<void> {
  const state = loadState();
  let running = true;
  while (running) {
    renderMenu(state);
    const option = await ask("  Selecciona una opción: ");
    if (option === null) {
      console.log("\n  Entrada cerrada. ¡Chau!");
      break;
    }
    try {
      switch (option) {
        case "1":
          await showDefaultWeather(state);
          break;
        case "2":
          await showAllWeather(state);
          break;
        case "3":
          await searchAndAdd(state);
          break;
        case "4":
          await removeCity(state);
          break;
        case "5":
          await setDefaultCity(state);
          break;
        case "6":
          await showForecast(state);
          break;
        case "8":
          toggleUnit(state);
          break;
        case "9":
          running = false;
          console.log("  ¡Chau!");
          break;
        default:
          console.log(red("  Opción inválida. Elegí 1, 2, 3, 4, 5, 6, 8 o 9."));
      }
    } catch (err) {
      console.log(red(`  ${err instanceof Error ? err.message : "Ocurrió un error inesperado."}`));
    }
    if (running) console.log();
  }
  rl.close();
}

await main();
