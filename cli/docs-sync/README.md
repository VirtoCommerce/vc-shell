# @vc-shell/docs-sync

CLI tool that publishes `*.docs.md` from vc-shell to the vc-docs site.

See `docs/superpowers/specs/2026-04-28-vc-shell-docs-sync-design.md` for the design.

## Commands

- `yarn workspace @vc-shell/docs-sync sync --target ../vc-docs`
- `yarn workspace @vc-shell/docs-sync lint:docs`
- `yarn workspace @vc-shell/docs-sync screenshot ...`

## Screenshot command

### Style guide

- viewport: 1280×800 (desktop) / 390×844 (mobile)
- pixel density: 2× (retina)
- no browser chrome
- both themes when visual differs; light only otherwise
- format: png (webp post-process is a follow-up)
- filenames: kebab-case, descriptive
- crop to selector, not viewport

### Examples

```bash
yarn workspace @vc-shell/docs-sync exec docs-sync screenshot \
  --url http://localhost:3000/products \
  --selector ".vc-blade--list" \
  --theme light \
  --out apps/vendor-portal/.../guides/blades/images/list-blade.png

yarn workspace @vc-shell/docs-sync exec docs-sync screenshot \
  --story organisms-vc-data-table--with-filters \
  --theme dark \
  --viewport 1280x800 \
  --out framework/.../images/data-table-filters-dark.png
```
