import { readStateFile, writeStateFile } from "./stateFile.ts";
import type { StateFileResult } from "./stateFile.ts";
import type { City } from "../types/City.ts";
import type { State } from "../types/State.ts";

export interface CitiesState {
  cities: City[];
  defaultCityId: number | null;
}

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

/** Carga las ciudades (y la default) del JSON local; vacío si falta o está corrupto. */
export function loadCities(raw: StateFileResult): CitiesState {
  const data = raw.data;
  return {
    cities: Array.isArray(data?.cities) ? data.cities.filter(isCity) : [],
    defaultCityId: typeof data?.defaultCityId === "number" ? data.defaultCityId : null,
  };
}

/** Guarda las ciudades: escribe el estado completo para mantener la forma del JSON. */
export function saveCities(state: State): void {
  writeStateFile(state);
}
