import { afterEach, describe, expect, test } from "bun:test";
import { getJson } from "../../src/api/client.ts";
import { restoreFetch, stubJsonFetch, stubNetworkError } from "./mockFetch.ts";

afterEach(restoreFetch);

describe("getJson", () => {
  test("devuelve el JSON parseado de una respuesta 200", async () => {
    stubJsonFetch({ ok: true });
    const data = await getJson<{ ok: boolean }>("https://ejemplo.com/x", "test");
    expect(data).toEqual({ ok: true });
  });

  test("HTTP de error → mensaje en español con el status", async () => {
    stubJsonFetch({ error: true }, 400);
    await expect(getJson("https://ejemplo.com/x", "clima")).rejects.toThrow(
      "OpenMeteo respondió HTTP 400 (clima).",
    );
  });

  test("fallo de red → mensaje de conexión en español", async () => {
    stubNetworkError();
    await expect(getJson("https://ejemplo.com/x", "búsqueda de ciudad")).rejects.toThrow(
      "No se pudo conectar con OpenMeteo (búsqueda de ciudad). Revisá tu conexión.",
    );
  });
});
