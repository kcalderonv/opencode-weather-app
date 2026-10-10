import * as readline from "node:readline";
import { showCityList, showError, showInfo } from "./output.ts";
import type { City } from "../types/City.ts";

// Nota: no usamos rl.question() de node:readline/promises porque en Bun cuelga
// para siempre al llegar EOF. Con los eventos "line" y "close" el EOF se maneja
// de forma determinística (ask() devuelve null).
// Las líneas se encolan para que también funcione con varias líneas de golpe
// (redirección de archivo o pegado de varias líneas en la terminal).
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const inputLines: string[] = [];
let resolveLine: ((value: string | null) => void) | null = null;
let inputClosed = false;

rl.on("line", (rawLine) => {
  const line = rawLine.trim();
  if (resolveLine !== null) {
    const resolve = resolveLine;
    resolveLine = null;
    resolve(line);
  } else {
    inputLines.push(line);
  }
});

rl.on("close", () => {
  inputClosed = true;
  if (resolveLine !== null) {
    const resolve = resolveLine;
    resolveLine = null;
    resolve(null);
  }
});

const isInteractive = process.stdin.isTTY === true;

/** Escribe el prompt y lee una línea; null si la entrada se cerró (EOF). */
export function ask(prompt: string): Promise<string | null> {
  const queued = inputLines.shift();
  if (queued !== undefined) {
    process.stdout.write(prompt);
    if (!isInteractive) console.log(queued); // eco simulado en modo no interactivo
    return Promise.resolve(queued);
  }
  if (inputClosed) return Promise.resolve(null);
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    resolveLine = (value) => {
      if (!isInteractive && value !== null) console.log(value); // eco simulado
      resolve(value);
    };
  });
}

/** Lista las ciudades y pide un número; null si cancela, inválido o EOF. */
export async function pickCity(cities: City[], prompt: string): Promise<City | null> {
  showCityList(cities);
  const input = await ask(prompt);
  if (input === null || input === "") {
    showInfo("  Cancelado.");
    return null;
  }
  const num = Number(input);
  if (!Number.isInteger(num) || num < 1) {
    showError("  Selección inválida.");
    return null;
  }
  const city = cities[num - 1];
  if (city === undefined) {
    showError("  Selección inválida.");
    return null;
  }
  return city;
}

/** Cierra la entrada (al salir de la app). */
export function closeInput(): void {
  rl.close();
}
