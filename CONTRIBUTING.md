# Contributing

## Local workflow

1. Install dependencies with `npm ci` and `npm --prefix mobile ci`.
2. Run the full validation pass with `npm run validate`.
3. Run the filesystem and secret scans with `npm run security:scan`.
4. Start the backend with `npm run dev`.
5. Start the Expo Go client with `npm --prefix mobile run start`.

## Change scope

- Keep fixes minimal and reversible.
- Prefer updating existing scripts and workflows over adding parallel tooling.
- Do not commit generated artifacts, local Expo caches, or secrets.

## Pull request parity

This repository validates the same categories locally and in GitHub Actions:

- backend/web build
- smoke tests and coverage
- mobile typecheck and Expo export
- production dependency audit
- Trivy and Gitleaks scans
