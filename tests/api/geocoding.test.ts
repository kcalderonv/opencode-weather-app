import { afterEach, describe, expect, test } from "bun:test";
import { geocode } from "../../src/api/geocoding.ts";
import { requestedUrl, restoreFetch, stubJsonFetch } from "./mockFetch.ts";

afterEach(restoreFetch);

const montevideo = {
  id: 3441575,
  name: "Montevideo",
  country: "Uruguay",
  admin1: "Departamento de Montevideo",
  latitude: -34.90328,
  longitude: -56.18816,
};

describe("geocode", () => {
  test("mapea los resultados a City y arma la URL con count=5, language=es y format=json", async () => {
    const fetchMock = stubJsonFetch({ results: [montevideo] });
    const cities = await geocode("Montevideo");

    const url = requestedUrl(fetchMock);
    expect(url).toContain("https://geocoding-api.open-meteo.com/v1/search?");
    expect(url).toContain("name=Montevideo");
    expect(url).toContain("count=5");
    expect(url).toContain("language=es");
    expect(url).toContain("format=json");
    expect(cities).toEqual([montevideo]);
  });

  test("respuesta sin results → []", async () => {
    stubJsonFetch({});
    expect(await geocode("Nadarlandia")).toEqual([]);
  });

  test("results vacío → []", async () => {
    stubJsonFetch({ results: [] });
    expect(await geocode("Nadarlandia")).toEqual([]);
  });
});
