import { run as runGetWeather } from "../actions/getWeather.ts";
import { run as runListCities } from "../actions/listCities.ts";
import { run as runAddCity } from "../actions/addCity.ts";
import { run as runRemoveCity } from "../actions/removeCity.ts";
import { run as runSetDefaultCity } from "../actions/setDefaultCity.ts";
import { run as runGetForecast } from "../actions/getForecast.ts";
import { run as runSettings } from "../actions/settings.ts";
import { showInfo } from "./output.ts";
import { BORDER, TITLE } from "../utils/constants.ts";
import { bold, cyan } from "../utils/colors.ts";
import { unitSymbol } from "../utils/format.ts";
import type { MenuOption } from "../types/MenuOption.ts";
import type { State } from "../types/State.ts";

/** Opción 9: solo despide; el loop corta por EXIT_OPTION. */
const runExit = async (): Promise<void> => {
  showInfo("  ¡Chau!");
};

/**
 * Tabla de opciones del menú: agregar una fila (más su archivo en actions/)
 * es todo lo que hace falta para sumar una opción nueva.
 */
export const MENU_OPTIONS: MenuOption[] = [
  { id: "1", label: () => "  1. Clima de ciudad default", run: runGetWeather },
  { id: "2", label: (state) => `  2. Clima de todas las ciudades (${state.cities.length})`, run: runListCities },
  { id: "3", label: () => "  3. Buscar y agregar ciudad", run: runAddCity },
  { id: "4", label: () => "  4. Eliminar ciudad", run: runRemoveCity },
  { id: "5", label: () => "  5. Establecer ciudad default", run: runSetDefaultCity },
  { id: "6", label: () => "  6. Pronóstico 7 días", run: runGetForecast },
  { id: "8", label: (state) => `  8. Ajustes (${unitSymbol(state.unit)})`, run: runSettings },
  { id: "9", label: () => "  9. Salir", run: runExit },
];

/** Busca la opción por lo que ingresó el usuario. */
export function findOption(id: string): MenuOption | undefined {
  return MENU_OPTIONS.find((option) => option.id === id);
}

/** Mensaje de opción inválida, armado desde la tabla (se actualiza solo). */
export function invalidOptionMessage(): string {
  const ids = MENU_OPTIONS.map((option) => option.id);
  const last = ids.at(-1) ?? "";
  const rest = ids.slice(0, -1).join(", ");
  return `  Opción inválida. Elegí ${rest} o ${last}.`;
}

export function renderMenu(state: State): void {
  const lines = [
    cyan(BORDER),
    bold(cyan(TITLE)),
    cyan(BORDER),
    ...MENU_OPTIONS.map((option) => option.label(state)),
    cyan(BORDER),
  ];
  showInfo(lines.join("\n"));
}
