/**
 * Ambient module declaration for .vue files.
 * Keep this file a script, with no top-level import or export: that would turn it into a
 * module, making `declare module "*.vue"` an augmentation, which does nothing for wildcard
 * modules.
 */

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
