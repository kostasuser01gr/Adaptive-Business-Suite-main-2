# Security Policy

## Reporting

Do not open public issues for suspected credentials, tokens, or exploitable vulnerabilities.

Instead:

1. Remove or rotate any exposed credential immediately.
2. Capture the affected file path, commit hash, and reproduction steps.
3. Report the issue privately to the repository owner with the minimal evidence needed to reproduce it.

## Repository hardening notes

- Runtime secrets must come from environment variables.
- Example configuration belongs in safe sample files only.
- Before shipping changes, run `npm run security:audit` and `npm run security:scan`.
- GitHub Actions should not echo secrets or write them into artifacts.

## Known accepted vulnerabilities

### GHSA-67mh-4wv8-2f99 — esbuild dev server CORS bypass (moderate)

- **Severity**: Moderate
- **Affects**: `esbuild ≤ 0.24.2` via `@esbuild-kit/core-utils` → `@esbuild-kit/esm-loader` → `drizzle-kit`
- **Scope**: Dev/build tooling only — `drizzle-kit` is a `devDependency`; not present in the production bundle
- **Production impact**: `npm audit --omit=dev` reports **0 vulnerabilities**
- **Fix cost**: Would require downgrading `drizzle-kit` to `0.18.1` (breaking schema API changes)
- **Decision**: Accept. The vulnerability requires a malicious website to reach the esbuild dev server, which is only started by developers on trusted machines, never in CI or production. Re-evaluate when `drizzle-kit` publishes a release with a patched `@esbuild-kit` dependency.
- **Reviewed**: 2026-03-17
