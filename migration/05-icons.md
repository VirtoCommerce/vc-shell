# 05. Icon Migration

## What Changed

Font Awesome has been deprecated. The framework now uses:

- **Lucide Icons** (prefix `lucide-`) — primary, recommended
- **Material Symbols** (prefix `material-`) — supported
- **Bootstrap Icons** (prefix `bi-`) — supported

The `@fortawesome/fontawesome-free` package has been removed from dependencies.

## Migration

### Step 1: Find all Font Awesome icons

```bash
grep -rn "fas \|far \|fab \|fa-" src/ --include="*.vue" --include="*.ts"
```

### Step 2: Replace with Lucide equivalents

```vue
<!-- Before -->
<VcIcon icon="fas fa-save" />
<VcIcon icon="fas fa-trash" />
<VcIcon icon="fas fa-plus" />
<VcIcon icon="fas fa-search" />
<VcIcon icon="fas fa-edit" />
<VcIcon icon="fas fa-times" />
<VcIcon icon="fas fa-check" />
<VcIcon icon="fas fa-chevron-right" />
<VcIcon icon="far fa-user" />
<VcIcon icon="fas fa-home" />

<!-- After -->
<VcIcon icon="lucide-save" />
<VcIcon icon="lucide-trash-2" />
<VcIcon icon="lucide-plus" />
<VcIcon icon="lucide-search" />
<VcIcon icon="lucide-pencil" />
<VcIcon icon="lucide-x" />
<VcIcon icon="lucide-check" />
<VcIcon icon="lucide-chevron-right" />
<VcIcon icon="lucide-user" />
<VcIcon icon="lucide-home" />
```

### Step 3: Remove Font Awesome imports from main.ts

```diff
-import "@fortawesome/fontawesome-free/css/all.min.css";
```

### Common Icon Mapping

| Font Awesome | Lucide |
|-------------|--------|
| `fas fa-save` | `lucide-save` |
| `fas fa-trash` / `fa-trash-alt` | `lucide-trash-2` |
| `fas fa-plus` | `lucide-plus` |
| `fas fa-minus` | `lucide-minus` |
| `fas fa-search` | `lucide-search` |
| `fas fa-edit` / `fa-pencil-alt` | `lucide-pencil` |
| `fas fa-times` | `lucide-x` |
| `fas fa-check` | `lucide-check` |
| `fas fa-chevron-right` | `lucide-chevron-right` |
| `fas fa-chevron-left` | `lucide-chevron-left` |
| `fas fa-chevron-down` | `lucide-chevron-down` |
| `fas fa-chevron-up` | `lucide-chevron-up` |
| `fas fa-home` | `lucide-home` |
| `far fa-user` / `fas fa-user` | `lucide-user` |
| `fas fa-cog` / `fa-gear` | `lucide-settings` |
| `fas fa-sign-out-alt` | `lucide-log-out` |
| `fas fa-download` | `lucide-download` |
| `fas fa-upload` | `lucide-upload` |
| `fas fa-copy` | `lucide-copy` |
| `fas fa-eye` | `lucide-eye` |
| `fas fa-eye-slash` | `lucide-eye-off` |
| `fas fa-info-circle` | `lucide-info` |
| `fas fa-exclamation-triangle` | `lucide-triangle-alert` |
| `fas fa-exclamation-circle` | `lucide-circle-alert` |
| `fas fa-check-circle` | `lucide-circle-check` |
| `fas fa-arrow-left` | `lucide-arrow-left` |
| `fas fa-arrow-right` | `lucide-arrow-right` |
| `fas fa-sync` / `fa-refresh` | `lucide-refresh-cw` |
| `fas fa-filter` | `lucide-filter` |
| `fas fa-sort` | `lucide-arrow-up-down` |
| `fas fa-ellipsis-v` | `lucide-ellipsis-vertical` |
| `fas fa-ellipsis-h` | `lucide-ellipsis` |
| `fas fa-calendar` | `lucide-calendar` |
| `fas fa-clock` | `lucide-clock` |
| `fas fa-link` | `lucide-link` |
| `fas fa-tag` | `lucide-tag` |
| `fas fa-star` | `lucide-star` |
| `fas fa-file` | `lucide-file` |
| `fas fa-folder` | `lucide-folder` |
| `fas fa-image` | `lucide-image` |
| `fas fa-lock` | `lucide-lock` |
| `fas fa-unlock` | `lucide-unlock` |

Browse all Lucide icons at [lucide.dev/icons](https://lucide.dev/icons).
