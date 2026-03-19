# 06. Styles & SCSS

## What Changed

1. `@import` → `@use` (modern Sass standard)
2. `base.scss` and `colors.scss` removed — integrated into the framework
3. Font CSS imports no longer needed in `main.ts`

## Migration

### Step 1: Remove font imports from main.ts

```diff
-import "@fortawesome/fontawesome-free/css/all.min.css";
-import "roboto-fontface/css/roboto/roboto-fontface.css";
```

The framework now auto-loads all required base styles.

### Step 2: Switch @import to @use in SCSS

```diff
 // src/styles/index.scss
-@import 'custom';
+@use 'custom';
```

### Step 3: Restructure style files

**Old structure:**
```
src/styles/
  base.scss      ← delete
  colors.scss    ← delete
  custom.scss
  index.scss
```

**New structure:**
```
src/styles/
  custom.scss
  index.scss
```

**Updated `src/styles/index.scss`:**
```scss
@use 'custom';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

Move any custom styles from `colors.scss` or `base.scss` into `custom.scss`.
