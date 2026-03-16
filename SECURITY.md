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
