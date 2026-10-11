// Helper de stubs de globalThis.fetch para los tests de api/.
// Sin dependencias: mock de bun:test + Response global.
import { mock } from "bun:test";

export const realFetch: typeof fetch = globalThis.fetch;

/** Restaura el fetch real (usar en afterEach). */
export function restoreFetch(): void {
  (globalThis as { fetch: unknown }).fetch = realFetch;
}

/** Stub que responde con un JSON fijo; devuelve el mock para inspeccionar llamadas. */
export function stubJsonFetch(body: unknown, status = 200) {
  // El parámetro hace que mock registre cada llamada con su URL (mock.calls).
  const fetchMock = mock((_url: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status })));
  (globalThis as { fetch: unknown }).fetch = fetchMock;
  return fetchMock;
}

/** Stub que simula un fallo de red (fetch rechaza). */
export function stubNetworkError(): void {
  (globalThis as { fetch: unknown }).fetch = () => Promise.reject(new TypeError("fetch failed"));
}

/** URL pedida en la llamada `call` (0-based) de un stub. */
export function requestedUrl(fetchMock: ReturnType<typeof stubJsonFetch>, call = 0): string {
  return String(fetchMock.mock.calls[call]?.[0] ?? "");
}
