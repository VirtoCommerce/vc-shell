/**
 * Global type augmentations for apps consuming @vc-shell/framework. Replaces
 * manual shims-vue.d.ts and vue-i18n.d.ts files.
 *
 * Usage — add to tsconfig.json:
 *   "compilerOptions": { "types": ["vite/client", "@vc-shell/framework/globals"] }
 *
 * The referenced files must stay separate: TypeScript treats `declare module "X"`
 * in a script as an ambient declaration ("*.vue") and in a module as an
 * augmentation ("@vue/runtime-core").
 */

/// <reference path="./shims-vue.d.ts" />
/// <reference path="./globals-augments.d.ts" />
/// <reference path="./typings/blade-macros.d.ts" />
