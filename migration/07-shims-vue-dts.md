# 07. Updating shims-vue.d.ts

## What Changed

Vue 3.5, vue-i18n, and TypeScript 5.8 require updated type declarations.

## Migration

Replace the content of your `shims-vue.d.ts`:

```typescript
/* eslint-disable */

import { CoreBladeAdditionalSettings } from "@vc-shell/framework";
import type { Ref } from "vue";
import type { Composer } from "vue-i18n";

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties extends _ComponentCustomProperties {
    $mergeLocaleMessage: Composer<{}, {}, {}, string, never, string>["mergeLocaleMessage"];
    $hasAccess: (permissions: string | string[] | undefined) => boolean;
    $isPhone: Ref<boolean>;
    $isTablet: Ref<boolean>;
    $isMobile: Ref<boolean>;
    $isDesktop: Ref<boolean>;
    $isTouch: boolean;
    $t: (key: string, ...args: any[]) => string;
  }

  interface ComponentOptionsBase extends CoreBladeAdditionalSettings {}
}

export {};
```

### Key Changes

- Added `$t` declaration
- Added `$mergeLocaleMessage` with type from `vue-i18n`'s `Composer`
- `ComponentCustomProperties` extends `_ComponentCustomProperties`
- Uses `import type` (modern TypeScript practice)
