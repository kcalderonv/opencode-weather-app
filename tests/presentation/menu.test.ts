import { describe, expect, test } from "bun:test";
import { findOption, invalidOptionMessage, MENU_OPTIONS, renderMenu } from "../../src/presentation/menu.ts";
import type { State } from "../../src/types/State.ts";

const state = (overrides: Partial<State> = {}): State => ({
  cities: [],
  defaultCityId: null,
  unit: "celsius",
  ...overrides,
});

const oneCity = (): State => state({ cities: [{ id: 1, name: "Lima", latitude: 0, longitude: 0 }] });

describe("MENU_OPTIONS", () => {
  test("los ids son los esperados, en orden", () => {
    expect(MENU_OPTIONS.map((option) => option.id)).toEqual(["1", "2", "3", "4", "5", "6", "8", "9"]);
  });

  test("el label de la opción 2 muestra la cantidad de ciudades", () => {
    const label = findOption("2")?.label;
    expect(label?.(state())).toContain("(0)");
    expect(label?.(oneCity())).toContain("(1)");
  });

  test("el label de la opción 8 muestra la unidad", () => {
    const label = findOption("8")?.label;
    expect(label?.(state())).toContain("(°C)");
    expect(label?.(state({ unit: "fahrenheit" }))).toContain("(°F)");
  });
});

describe("findOption", () => {
  test("encuentra por id", () => {
    expect(findOption("6")?.id).toBe("6");
    expect(findOption("9")).toBeDefined();
  });

  test("desconocida → undefined", () => {
    expect(findOption("x")).toBeUndefined();
    expect(findOption("7")).toBeUndefined(); // el 7 no existe a propósito
  });
});

describe("invalidOptionMessage", () => {
  test("menciona todos los ids de la tabla, en orden", () => {
    expect(invalidOptionMessage()).toBe("  Opción inválida. Elegí 1, 2, 3, 4, 5, 6, 8 o 9.");
  });
});

describe("renderMenu", () => {
  test("imprime título, marco y las opciones con sus labels dinámicos", () => {
    const printed: string[] = [];
    const original = console.log;
    console.log = (message: string) => {
      printed.push(message);
    };
    try {
      renderMenu(oneCity());
      renderMenu(state({ unit: "fahrenheit" }));
    } finally {
      console.log = original;
    }
    const out = printed.join("\n");
    expect(out).toContain("WEATHER CLI");
    expect(out).toContain("═".repeat(40));
    expect(out).toContain("  2. Clima de todas las ciudades (1)");
    expect(out).toContain("  6. Pronóstico 7 días");
    expect(out).toContain("  8. Ajustes (°F)");
    expect(out).toContain("  9. Salir");
  });
});
