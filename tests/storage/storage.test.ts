import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCities, saveCities } from "../../src/storage/citiesStorage.ts";
import { loadUnit, saveUnit } from "../../src/storage/settingsStorage.ts";
import { readStateFile, STATE_FILE } from "../../src/storage/stateFile.ts";
import type { City } from "../../src/types/City.ts";
import type { State } from "../../src/types/State.ts";

// weather-cli.json se resuelve relativo al cwd: corremos en un directorio
// temporal para no tocar jamás el estado real del usuario.
// (bun test ejecuta cada archivo en su propio proceso, y restauramos el cwd.)
const originalCwd = process.cwd();
let dir: string;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "weather-cli-test-"));
  process.chdir(dir);
});

afterAll(() => {
  process.chdir(originalCwd);
  rmSync(dir, { recursive: true, force: true });
});

const city = (id: number, name: string): City => ({
  id,
  name,
  latitude: -12.04,
  longitude: -77.02,
  country: "Perú",
});

const writeJson = (body: unknown): void => writeFileSync(STATE_FILE, JSON.stringify(body), "utf8");

describe("stateFile", () => {
  test("archivo faltante: no existe, no corrupto, data null", () => {
    rmSync(STATE_FILE, { force: true });
    const raw = readStateFile();
    expect(raw.exists).toBe(false);
    expect(raw.corrupted).toBe(false);
    expect(raw.data).toBe(null);
  });

  test("JSON corrupto: corrupted=true y data null", () => {
    writeFileSync(STATE_FILE, "esto no es json {{{", "utf8");
    const raw = readStateFile();
    expect(raw.exists).toBe(true);
    expect(raw.corrupted).toBe(true);
    expect(raw.data).toBe(null);
  });

  test("JSON válido que no es objeto (ej. array): data null y no corrupto", () => {
    writeJson([1, 2]);
    const raw = readStateFile();
    expect(raw.corrupted).toBe(false);
    expect(raw.data).toBe(null);
  });

  test("JSON válido: data con el estado", () => {
    writeJson({ cities: [city(1, "Lima")], defaultCityId: 1, unit: "fahrenheit" });
    expect(readStateFile().data?.cities).toHaveLength(1);
  });
});

describe("citiesStorage", () => {
  test("archivo faltante → ciudades vacías y default null", () => {
    rmSync(STATE_FILE, { force: true });
    const loaded = loadCities(readStateFile());
    expect(loaded.cities).toEqual([]);
    expect(loaded.defaultCityId).toBe(null);
  });

  test("corrupto → vacío", () => {
    writeFileSync(STATE_FILE, "garbage", "utf8");
    expect(loadCities(readStateFile()).cities).toEqual([]);
  });

  test("carga las ciudades válidas y la default", () => {
    writeJson({ cities: [city(1, "Lima"), city(2, "Ottawa")], defaultCityId: 2, unit: "celsius" });
    const loaded = loadCities(readStateFile());
    expect(loaded.cities).toHaveLength(2);
    expect(loaded.defaultCityId).toBe(2);
    expect(loaded.cities[0]?.name).toBe("Lima");
    expect(loaded.cities[1]?.name).toBe("Ottawa");
  });

  test("filtra las entradas que no son ciudades", () => {
    writeJson({
      cities: [city(1, "Lima"), { id: "x", name: 42 }, "basura", null],
      defaultCityId: null,
      unit: "celsius",
    });
    const loaded = loadCities(readStateFile());
    expect(loaded.cities).toHaveLength(1);
    expect(loaded.cities[0]?.name).toBe("Lima");
  });

  test("defaultCityId de tipo no numérico → null", () => {
    writeJson({ cities: [], defaultCityId: "2", unit: "celsius" });
    expect(loadCities(readStateFile()).defaultCityId).toBe(null);
  });

  test("saveCities escribe el estado completo con la forma del JSON", () => {
    rmSync(STATE_FILE, { force: true });
    const state: State = { cities: [city(3441575, "Montevideo")], defaultCityId: 3441575, unit: "fahrenheit" };
    saveCities(state);
    const text = readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(text) as State;
    expect(parsed.cities).toHaveLength(1);
    expect(parsed.defaultCityId).toBe(3441575);
    expect(parsed.unit).toBe("fahrenheit");
    expect(text.endsWith("\n")).toBe(true); // trailing newline, como siempre
  });
});

describe("settingsStorage", () => {
  test("archivo faltante → celsius", () => {
    rmSync(STATE_FILE, { force: true });
    expect(loadUnit(readStateFile())).toBe("celsius");
  });

  test("corrupto → celsius", () => {
    writeFileSync(STATE_FILE, "garbage", "utf8");
    expect(loadUnit(readStateFile())).toBe("celsius");
  });

  test("fahrenheit persistido → fahrenheit", () => {
    writeJson({ unit: "fahrenheit" });
    expect(loadUnit(readStateFile())).toBe("fahrenheit");
  });

  test("valor desconocido → celsius", () => {
    writeJson({ unit: "kelvin" });
    expect(loadUnit(readStateFile())).toBe("celsius");
  });

  test("saveUnit escribe el estado completo", () => {
    rmSync(STATE_FILE, { force: true });
    saveUnit({ cities: [], defaultCityId: null, unit: "fahrenheit" });
    const parsed = JSON.parse(readFileSync(STATE_FILE, "utf8")) as State;
    expect(parsed.unit).toBe("fahrenheit");
    expect(parsed.cities).toEqual([]);
    expect(parsed.defaultCityId).toBe(null);
  });
});
