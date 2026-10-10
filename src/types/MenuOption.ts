import type { State } from "./State.ts";

/** Una opción del menú: id, etiqueta (puede depender del estado) y acción. */
export interface MenuOption {
  id: string;
  label: (state: State) => string;
  run: (state: State) => Promise<void>;
}
