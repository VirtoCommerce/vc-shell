# Task Completion Checklist for VC-Shell

## Before Committing Code

1. **Lint Check**
   ```bash
   yarn lint
   ```

2. **TypeScript Check**
   - Ensure no type errors in modified files
   - Run `vue-tsc` if needed for Vue files

3. **Storybook Verification**
   - If UI components changed, verify in Storybook
   ```bash
   yarn storybook-serve
   ```

4. **Locale Check**
   ```bash
   yarn check-locales
   ```

## Code Style Requirements

- Use Composition API with `<script setup>`
- Follow existing naming conventions (`vc-` prefix for components)
- Use CSS variables for themeable values
- Keep components generic where appropriate
- Export types from `types.ts` files
- Add stories for new components

## Commit Convention
- Follow conventional commits: `feat:`, `fix:`, `chore:`, etc.
- See `.github/COMMIT_CONVENTION.md` for details
