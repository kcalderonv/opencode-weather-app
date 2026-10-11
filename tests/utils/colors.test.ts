import { describe, expect, test } from "bun:test";
import { bold, cyan, green, red, yellow } from "../../src/utils/colors.ts";

// El módulo decide la activación al importarse (TTY / NO_COLOR / FORCE_COLOR).
// El test replica esa misma condición y verifica el contrato: activados →
// envuelven con ANSI; desactivados → devuelven el texto tal cual.
const enabled =
  process.env.FORCE_COLOR === "1" ||
  (process.stdout.isTTY === true && (process.env.NO_COLOR ?? "") === "");

describe("colors", () => {
  test("respetan la activación (TTY / NO_COLOR / FORCE_COLOR)", () => {
    if (enabled) {
      expect(cyan("x")).toBe("\x1b[36mx\x1b[0m");
      expect(yellow("x")).toBe("\x1b[33mx\x1b[0m");
      expect(green("x")).toBe("\x1b[32mx\x1b[0m");
      expect(red("x")).toBe("\x1b[31mx\x1b[0m");
      expect(bold("x")).toBe("\x1b[1mx\x1b[0m");
    } else {
      expect(cyan("x")).toBe("x");
      expect(yellow("x")).toBe("x");
      expect(green("x")).toBe("x");
      expect(red("x")).toBe("x");
      expect(bold("x")).toBe("x");
      expect(cyan("x")).not.toContain("\x1b");
    }
  });
});
