# Locale Imports

## Severity: **Breaking** (if you imported framework locales directly)

## What Changed

The wildcard export `@vc-shell/framework/dist/locales/*` has been removed. Framework locales are now available as named, typed ES module exports.

## Before

```typescript
// Raw JSON import — no types, no autocomplete
import en from '@vc-shell/framework/dist/locales/en.json'
```

## After

```typescript
// Typed ES module — full autocomplete, VcShellLocale interface
import en from '@vc-shell/framework/locales/en'
import type { VcShellLocale, VcShellLocalePartial } from '@vc-shell/framework/locales/types'
```

## Full Translation Example

```typescript
import en from '@vc-shell/framework/locales/en'
import type { VcShellLocale } from '@vc-shell/framework/locales/types'

const fr: VcShellLocale = {
  ...en,
  CORE: { THEMES: { LIGHT: "Clair", DARK: "Sombre" } },
  SHELL: {
    ...en.SHELL,
    ACCOUNT: {
      SETTINGS: "Paramètres",
      CHANGE_PASSWORD: "Changer le mot de passe",
      PROFILE: "Profil",
      LOGOUT: "Déconnexion",
    },
  },
  // ... translate remaining sections
}

// Register in your app setup:
app.config.globalProperties.$mergeLocaleMessage('fr', fr)
```

## Partial Override Example

```typescript
import type { VcShellLocalePartial } from '@vc-shell/framework/locales/types'

const overrides: VcShellLocalePartial = {
  SHELL: { ACCOUNT: { LOGOUT: "Sign Out" } }
}

app.config.globalProperties.$mergeLocaleMessage('en', overrides)
```

## Validation

Run the CLI to check your locale file for missing/extra keys:

```bash
npx vc-check-locales ./src/locales/fr.json
```
