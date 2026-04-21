# configs

Shared configuration packages and curated assets consumed by the framework, its CLIs, and the monorepo release flow.

## Layout

| Path                 | Purpose                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `ts-config/`         | Shared TypeScript config (`@vc-shell/ts-config`), extended by each workspace. |
| `vite-config/`       | Shared Vite config (`@vc-shell/vite-config`).                                 |
| `peer-versions.json` | Curated peer-dependency versions recommended by the framework. See below.     |

## `peer-versions.json`

Single curated source of non-`@vc-shell/*` peer-dep versions the framework team recommends for consumer apps. Maintained by hand at release time.

### Shape

```json
{
  "description": "…",
  "versions": {
    "eslint": "^9.35.0",
    "vite": "^6.3.3",
    "…": "…"
  }
}
```

Only the `versions` map is consumed; `description` is a free-form note for readers.

### Consumers

- **`@vc-shell/migrate`** (`cli/migrate/src/baseline-versions.ts`) — hand-mirrored TypeScript constant, baked into the published migrator package. When run with `--update-deps`, the migrator performs intersection-based alignment of the target app's `package.json` against these versions.
- **`scripts/utils.ts → updateBoilerplatePkgVersions`** — reads this file directly at release time and syncs scaffold template versions (`cli/create-vc-app/src/templates/*/_package.json.ejs`).

### Maintenance

When updating curated versions at release time:

1. Edit `configs/peer-versions.json` — bump the entries you want to move forward.
2. **Edit `cli/migrate/src/baseline-versions.ts` to mirror the same values** — it's a hand-maintained copy because the migrator is a published npm package whose `dist/` must be self-contained.
3. Commit both changes together.

The drift-check test at `cli/migrate/tests/baseline-parity.test.ts` fails if these two files go out of sync — so CI catches forgotten updates.

### Why a manual mirror

The migrator ships as `@vc-shell/migrate` to npm. Consumers installing that package do **not** receive `configs/peer-versions.json` — only the package's own `dist/`. Mirroring the map into `cli/migrate/src/baseline-versions.ts` keeps the published artifact self-contained. A future prebuild step could automate this (see `cli/migrate/src/baseline-versions.ts` header comment).
