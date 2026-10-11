import { afterEach, describe, expect, test } from "bun:test";
import { getCurrentWeather, getDailyForecast } from "../../src/api/weather.ts";
import { requestedUrl, restoreFetch, stubJsonFetch } from "./mockFetch.ts";

afterEach(restoreFetch);

describe("getCurrentWeather", () => {
  test("devuelve la temperatura y pide current=temperature_2m con la unidad", async () => {
    const fetchMock = stubJsonFetch({ current: { temperature_2m: 13.4 } });
    const temp = await getCurrentWeather(-34.9, -56.19, "fahrenheit");

    const url = requestedUrl(fetchMock);
    expect(url).toContain("https://api.open-meteo.com/v1/forecast?");
    expect(url).toContain("latitude=-34.9");
    expect(url).toContain("longitude=-56.19");
    expect(url).toContain("current=temperature_2m");
    expect(url).toContain("temperature_unit=fahrenheit");
    expect(temp).toBe(13.4);
  });

  test("respuesta sin current → error en español", async () => {
    stubJsonFetch({});
    await expect(getCurrentWeather(0, 0, "celsius")).rejects.toThrow(
      "La respuesta del clima no incluyó la temperatura.",
    );
  });
});

describe("getDailyForecast", () => {
  test("zipea los 7 días y pide daily con timezone=auto y forecast_days=7", async () => {
    const fetchMock = stubJsonFetch({
      daily: {
        time: ["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"],
        temperature_2m_max: [25, 24, 23, 22, 21, 20, 19],
        temperature_2m_min: [15, 14, 13, 12, 11, 10, 9],
      },
    });
    const forecast = await getDailyForecast(-34.9, -56.19, "celsius");

    const url = requestedUrl(fetchMock);
    expect(url).toContain("daily=temperature_2m_max%2Ctemperature_2m_min"); // la coma va encodeada
    expect(url).toContain("temperature_unit=celsius");
    expect(url).toContain("timezone=auto");
    expect(url).toContain("forecast_days=7");
    expect(forecast).toHaveLength(7);
    expect(forecast[0]).toEqual({ date: "2026-10-10", max: 25, min: 15 });
    expect(forecast[6]).toEqual({ date: "2026-10-16", max: 19, min: 9 });
  });

  test("salta las entradas incompletas de la respuesta", async () => {
    stubJsonFetch({
      daily: {
        time: ["2026-10-10", "2026-10-11"],
        temperature_2m_max: [25], // solo un max: la segunda entrada queda incompleta
        temperature_2m_min: [15, 14],
      },
    });
    const forecast = await getDailyForecast(0, 0, "celsius");
    expect(forecast).toEqual([{ date: "2026-10-10", max: 25, min: 15 }]);
  });

  test("respuesta sin daily → error en español", async () => {
    stubJsonFetch({});
    await expect(getDailyForecast(0, 0, "celsius")).rejects.toThrow(
      "La respuesta del pronóstico no incluyó datos diarios.",
    );
  });
});
