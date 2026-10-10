# AGENTS.md

Weather CLI practice project: an interactive console app that looks up city weather via OpenMeteo and eventually compiles to a standalone executable. `README.md` (Spanish) is the spec of record — it defines the target menu layout and features; follow it for app behavior.

## Runtime & commands

- Bun only (`bun.lock`; no npm/yarn). No scripts in `package.json` — invoke Bun directly:
  - Run: `bun index.ts`
  - Install deps: `bun install`
  - Typecheck: `bunx tsc --noEmit` (`tsconfig.json` is strict, `noEmit`; there is no build step — Bun runs TS directly)
  - Compile the final binary: `bun build --compile index.ts --outfile weather`
- No tests, lint, or CI are configured; verify changes by running the CLI.

## API flow (no key required)

Two chained OpenMeteo calls, no auth or env vars needed:

1. Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
2. Forecast: `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m`

## Conventions

- User-facing strings (menus, prompts, errors) are in Spanish, matching the README example menu.
- Per README, state must persist across runs: default city, saved city list, and unit setting (°C/°F).
- TS quirks from `tsconfig.json`: `noUncheckedIndexedAccess` (indexing yields `T | undefined`), `verbatimModuleSyntax` (type-only imports need `import type`), `allowImportingTsExtensions` (relative imports include the `.ts` extension).
- No runtime dependencies — prefer Bun built-ins (global `fetch`, `Bun.write`, etc.) over adding packages.
