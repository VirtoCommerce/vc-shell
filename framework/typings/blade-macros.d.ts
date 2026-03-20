import type { BladeDefinition } from "@vc-shell/framework";

declare global {
  /**
   * Define blade metadata — compiled to defineOptions + __registerBladeConfig by viteBladePlugin.
   *
   * @example
   * ```ts
   * defineBlade({
   *   name: "Orders",
   *   url: "/orders",
   *   isWorkspace: true,
   *   permissions: ["seller:orders:view"],
   *   menuItem: {
   *     title: "ORDERS.MENU.TITLE",
   *     icon: "lucide-shopping-cart",
   *     priority: 1,
   *   },
   * });
   * ```
   */
  function defineBlade(options: BladeDefinition): void;
}

export {};
