import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { red } from "./colors.ts";
import type { City, State, Unit } from "./types.ts";

// Estado persistente en un JSON local (directorio desde donde se ejecuta la app).
const FILE = "weather-cli.json";

const initialState = (): State => ({ cities: [], defaultCityId: null, unit: "celsius" });

function isCity(value: unknown): value is City {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Partial<City>;
  return (
    typeof c.id === "number" &&
    typeof c.name === "string" &&
    typeof c.latitude === "number" &&
    typeof c.longitude === "number"
  );
}

export function loadState(): State {
  if (!existsSync(FILE)) return initialState();
  try {
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as Partial<State>;
    return {
      cities: Array.isArray(raw.cities) ? raw.cities.filter(isCity) : [],
      defaultCityId: typeof raw.defaultCityId === "number" ? raw.defaultCityId : null,
      unit: (raw.unit === "fahrenheit" ? "fahrenheit" : "celsius") as Unit,
    };
  } catch {
    console.log(red("  Aviso: weather-cli.json está corrupto; se empieza con estado vacío."));
    return initialState();
  }
}

export function saveState(state: State): void {
  writeFileSync(FILE, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
