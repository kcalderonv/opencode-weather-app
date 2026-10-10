# AGENTS.md

Weather CLI practice project: an interactive console app that looks up city weather via OpenMeteo and eventually compiles to a standalone executable. `README.md` (Spanish) is the spec of record — it defines the target menu layout and features; follow it for app behavior.

## Runtime & commands

- Bun only (`bun.lock`; no npm/yarn). Scripts in `package.json`:
  - `bun run dev` — run from source with auto-restart on changes (`bun --watch`; stays alive after the app exits, stop with Ctrl+C)
  - `bun run start` — run from source
  - `bun run build` — compile the standalone binary `weather.exe` (`bun build --compile index.ts --outfile weather`). The `run` matters: plain `bun build` (like `bun test`) is Bun's own built-in command and ignores the script
  - Install deps: `bun install`
  - Typecheck: `bunx tsc --noEmit` (`tsconfig.json` is strict, `noEmit`; Bun runs TS directly, no build step needed)
- No tests, lint, or CI are configured; verify changes by running the CLI. For non-interactive runs, redirect a file via cmd (`cmd /c "bun run start < input.txt"`): PowerShell pipes never close stdin, so the app would wait forever. EOF exits cleanly.

## API flow (no key required)

Two chained OpenMeteo calls, no auth or env vars needed:

1. Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
2. Forecast: `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m`

## Conventions

- User-facing strings (menus, prompts, errors) are in Spanish, matching the README example menu.
- Colors live in `colors.ts` (raw ANSI, no deps): cyan menu frame/title (bold title), yellow temperature, green success, red errors. Only enabled when stdout is a TTY; `NO_COLOR` disables, `FORCE_COLOR=1` forces (handy for redirected-run testing).
- State persists in `weather-cli.json` in the working directory (saved cities, default city id, unit setting °C/°F); it is gitignored and holds real user data — when testing flows that modify it, do so from a temp cwd or restore the file afterwards.
- TS quirks from `tsconfig.json`: `noUncheckedIndexedAccess` (indexing yields `T | undefined`), `verbatimModuleSyntax` (type-only imports need `import type`), `allowImportingTsExtensions` (relative imports include the `.ts` extension).
- No runtime dependencies — prefer Bun built-ins (global `fetch`, `Bun.write`, etc.) over adding packages.
