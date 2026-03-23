/**
 * Ambient module declaration for .vue files.
 *
 * IMPORTANT: This file MUST remain a script (no top-level import/export).
 * A top-level import would turn it into a module, making `declare module "*.vue"`
 * an augmentation (which does nothing for wildcard modules) instead of an
 * ambient declaration.
 */

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
