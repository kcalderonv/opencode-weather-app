import type { City } from "./City.ts";
import type { Unit } from "./Weather.ts";

export interface State {
  cities: City[];
  defaultCityId: number | null;
  unit: Unit;
}
