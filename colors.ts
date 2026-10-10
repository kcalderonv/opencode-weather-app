// Colores ANSI directos, sin dependencias.
// Se activan solo si stdout es una terminal (TTY):
// - NO_COLOR (cualquier valor no vacío) los desactiva (convención estándar).
// - FORCE_COLOR=1 los fuerza (útil para probar con la salida redirigida).

const noColor = (process.env.NO_COLOR ?? "") !== "";
const forceColor = process.env.FORCE_COLOR === "1";
const enabled = forceColor || (process.stdout.isTTY === true && !noColor);

function paint(code: string) {
  return (text: string): string => (enabled ? `\x1b[${code}m${text}\x1b[0m` : text);
}

export const cyan = paint("36");
export const yellow = paint("33");
export const green = paint("32");
export const red = paint("31");
export const bold = paint("1");
