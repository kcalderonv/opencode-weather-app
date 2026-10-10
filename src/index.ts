import { readStateFile } from "./storage/stateFile.ts";
import { loadCities } from "./storage/citiesStorage.ts";
import { loadUnit } from "./storage/settingsStorage.ts";
import { findOption, invalidOptionMessage, renderMenu } from "./presentation/menu.ts";
import { ask, closeInput } from "./presentation/input.ts";
import { showError, showInfo } from "./presentation/output.ts";
import { EXIT_OPTION } from "./utils/constants.ts";
import type { State } from "./types/State.ts";

/** Loop principal: cargar estado → menú → opción → despachar → repetir. */
async function main(): Promise<void> {
  const raw = readStateFile();
  if (raw.corrupted) {
    showError("  Aviso: weather-cli.json está corrupto; se empieza con estado vacío.");
  }
  const state: State = { ...loadCities(raw), unit: loadUnit(raw) };

  let running = true;
  while (running) {
    renderMenu(state);
    const input = await ask("  Selecciona una opción: ");
    if (input === null) {
      showInfo("\n  Entrada cerrada. ¡Chau!");
      break;
    }
    const option = findOption(input);
    try {
      if (option === undefined) {
        showError(invalidOptionMessage());
      } else {
        await option.run(state);
        if (option.id === EXIT_OPTION) running = false;
      }
    } catch (err) {
      showError(`  ${err instanceof Error ? err.message : "Ocurrió un error inesperado."}`);
    }
    if (running) showInfo("");
  }
  closeInput();
}

await main();
