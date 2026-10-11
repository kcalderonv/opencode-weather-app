import { describe, expect, test } from "bun:test";
import { formatCity, formatForecastDate, unitSymbol } from "../../src/utils/format.ts";
import type { City } from "../../src/types/City.ts";

const city = (overrides: Partial<City> = {}): City => ({
  id: 1,
  name: "Lima",
  latitude: -12.04,
  longitude: -77.02,
  ...overrides,
});

describe("formatCity", () => {
  test("une nombre, región y país", () => {
    expect(formatCity(city({ admin1: "Provincia de Lima", country: "Perú" }))).toBe(
      "Lima, Provincia de Lima, Perú",
    );
  });

  test("salta las partes que faltan", () => {
    expect(formatCity(city({ country: "Perú" }))).toBe("Lima, Perú");
  });

  test("salta las partes vacías", () => {
    expect(formatCity(city({ admin1: "", country: "" }))).toBe("Lima");
  });
});

describe("formatForecastDate", () => {
  test("formato 'día dd/mm' con el día de la semana correcto", () => {
    expect(formatForecastDate("2026-10-10")).toBe("sáb 10/10"); // 10/10/2026 es sábado
    expect(formatForecastDate("2026-10-11")).toBe("dom 11/10");
    expect(formatForecastDate("2026-10-15")).toBe("jue 15/10");
  });

  test("fecha sin partes suficientes se devuelve tal cual", () => {
    expect(formatForecastDate("nada")).toBe("nada");
    expect(formatForecastDate("2026-10")).toBe("2026-10");
  });
});

describe("unitSymbol", () => {
  test("celsius y fahrenheit", () => {
    expect(unitSymbol("celsius")).toBe("°C");
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });
});
