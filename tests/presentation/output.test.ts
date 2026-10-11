import { describe, expect, test } from "bun:test";
import { showCityList, showForecastHeader, showForecastRow, showInfo, showWeatherLine } from "../../src/presentation/output.ts";
import type { City } from "../../src/types/City.ts";

const lima: City = {
  id: 1,
  name: "Lima",
  admin1: "Provincia de Lima",
  country: "Perú",
  latitude: -12.04,
  longitude: -77.02,
};

// Quita códigos ANSI por si los colores llegan activados (p. ej. TTY).
const stripAnsi = (text: string): string => text.replace(/\x1b\[[0-9;]*m/g, "");

function capture(fn: () => void): string[] {
  const printed: string[] = [];
  const original = console.log;
  console.log = (message: string) => {
    printed.push(message);
  };
  try {
    fn();
  } finally {
    console.log = original;
  }
  return printed;
}

describe("output", () => {
  test("showWeatherLine: '  Ciudad: 12.5 °C'", () => {
    const printed = capture(() => showWeatherLine(lima, 12.5, "celsius"));
    expect(stripAnsi(printed[0] ?? "")).toBe("  Lima, Provincia de Lima, Perú: 12.5 °C");
  });

  test("showForecastRow: fecha, máx y mín con la unidad", () => {
    const printed = capture(() => showForecastRow({ date: "2026-10-10", max: 25.5, min: 20.7 }, "fahrenheit"));
    const line = stripAnsi(printed[0] ?? "");
    expect(line).toContain("10/10");
    expect(line).toContain("máx 25.5 °F");
    expect(line).toContain("mín 20.7 °F");
  });

  test("showForecastHeader: título con la ciudad", () => {
    const printed = capture(() => showForecastHeader(lima));
    expect(stripAnsi(printed[0] ?? "")).toBe("  Pronóstico 7 días — Lima, Provincia de Lima, Perú");
  });

  test("showCityList: lista numerada", () => {
    const printed = capture(() => showCityList([lima]));
    expect(printed).toEqual(["  1) Lima, Provincia de Lima, Perú"]);
  });

  test("showInfo imprime tal cual (sin color)", () => {
    const printed = capture(() => showInfo("  ¡Chau!"));
    expect(printed).toEqual(["  ¡Chau!"]);
  });
});
