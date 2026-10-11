import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// End-to-end SIN red: corre la app real (bun src/index.ts) como subproceso con
// la entrada por pipe y un cwd temporal (weather-cli.json aislado del repo).
// FORCE_COLOR=0/1 fija el estado de colores sin depender de la terminal.

const ENTRY = join(import.meta.dir, "..", "src", "index.ts");

interface RunResult {
  stdout: string;
  exitCode: number;
  stateFileCreated: boolean;
}

async function runApp(input: string, env: Record<string, string>, setup?: (cwd: string) => void): Promise<RunResult> {
  const cwd = mkdtempSync(join(tmpdir(), "weather-cli-smoke-"));
  try {
    setup?.(cwd);
    const proc = Bun.spawn([process.execPath, ENTRY], {
      cwd,
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, ...env },
    });
    proc.stdin.write(input);
    proc.stdin.end();
    const stdout = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;
    return { stdout, exitCode, stateFileCreated: existsSync(join(cwd, "weather-cli.json")) };
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

describe("smoke (app end-to-end, sin red)", () => {
  test("menú, estado vacío, opción inválida y salida por 9", async () => {
    const { stdout, exitCode, stateFileCreated } = await runApp("1\n2\nx\n9\n", { FORCE_COLOR: "0" });
    expect(exitCode).toBe(0);
    expect(stdout).toContain("WEATHER CLI");
    expect(stdout).toContain("  6. Pronóstico 7 días");
    expect(stdout).toContain("No hay ciudad default. Usá la opción 5 para establecerla.");
    expect(stdout).toContain("No hay ciudades guardadas. Usá la opción 3 para agregar una.");
    expect(stdout).toContain("Opción inválida. Elegí 1, 2, 3, 4, 5, 6, 8 o 9.");
    expect(stdout).toContain("¡Chau!");
    expect(stdout).not.toContain("\x1b["); // sin TTY y sin FORCE_COLOR → sin colores
    expect(stateFileCreated).toBe(false); // nada de esto guarda estado
  });

  test("EOF corta la app limpiamente", async () => {
    const { stdout, exitCode } = await runApp("", { FORCE_COLOR: "0" });
    expect(stdout).toContain("Entrada cerrada. ¡Chau!");
    expect(exitCode).toBe(0);
  });

  test("JSON corrupto → aviso en español y arranca vacío", async () => {
    const { stdout } = await runApp("9\n", { FORCE_COLOR: "0" }, (cwd) => {
      writeFileSync(join(cwd, "weather-cli.json"), "esto no es json {{{", "utf8");
    });
    expect(stdout).toContain("weather-cli.json está corrupto");
    expect(stdout).toContain("Clima de todas las ciudades (0)");
  });

  test("FORCE_COLOR=1 → el menú lleva códigos ANSI", async () => {
    const { stdout } = await runApp("9\n", { FORCE_COLOR: "1" });
    expect(stdout).toContain("\x1b[36m"); // cyan del marco
  });
});
