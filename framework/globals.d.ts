/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Global type augmentations for apps consuming @vc-shell/framework.
 *
 * Usage — add to tsconfig.json:
 *   "compilerOptions": { "types": ["vite/client", "@vc-shell/framework/globals"] }
 *
 * This replaces manual shims-vue.d.ts and vue-i18n.d.ts files.
 *
 * This file is an umbrella entry point that pulls in:
 * - shims-vue.d.ts   (script — ambient `declare module "*.vue"`)
 * - globals-augments.d.ts (module — `@vue/runtime-core` augmentation)
 *
 * They MUST be separate files because TypeScript treats `declare module "X"`
 * differently in scripts vs modules:
 * - Script file → ambient declaration (creates the module from scratch)
 * - Module file → augmentation (extends an existing module)
 * We need "*.vue" as ambient and "@vue/runtime-core" as augmentation.
 */

/// <reference path="./shims-vue.d.ts" />
/// <reference path="./globals-augments.d.ts" />
/// <reference path="./typings/blade-macros.d.ts" />
