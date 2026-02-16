/**
 * ColumnCollector - Utility for collecting VcColumn instances from slots
 *
 * This is inspired by PrimeVue's HelperSet pattern.
 * VcColumn components register themselves via inject/provide when mounted.
 *
 * Usage in VcDataTable:
 * ```ts
 * const columnCollector = new ColumnCollector();
 * provide('$columns', columnCollector);
 *
 * // Get collected columns
 * const columns = computed(() => columnCollector.getColumns());
 * ```
 */

import type { ComponentInternalInstance, Slots, VNode } from "vue";
import type { VcColumnProps } from "../types";

export interface ColumnInstance {
  instance: ComponentInternalInstance;
  props: VcColumnProps;
  slots: Slots;
}

export class ColumnCollector {
  private columns: Map<ComponentInternalInstance, ColumnInstance> = new Map();
  private updateCallback: (() => void) | null = null;

  /**
   * Set a callback to be called when columns change
   */
  onUpdate(callback: () => void): void {
    this.updateCallback = callback;
  }

  /**
   * Add a column instance
   */
  add(column: ColumnInstance): void {
    this.columns.set(column.instance, column);
    this.triggerUpdate();
  }

  /**
   * Delete a column instance
   */
  delete(instance: ComponentInternalInstance): void {
    this.columns.delete(instance);
    this.triggerUpdate();
  }

  /**
   * Clear all columns
   */
  clear(): void {
    this.columns.clear();
    this.triggerUpdate();
  }

  /**
   * Get all column instances as array
   */
  getAll(): ColumnInstance[] {
    return Array.from(this.columns.values());
  }

  /**
   * Get columns sorted by their order in the DOM (vnode order)
   * This ensures columns appear in the order they are declared in template
   */
  getColumns(): ColumnInstance[] {
    // Sort by vnode.key or index to maintain declaration order
    const columns = this.getAll();

    // Filter out any invalid columns and sort by component uid
    return columns
      .filter((col): col is ColumnInstance =>
        col != null && col.instance != null && col.props != null && col.props.id != null
      )
      .sort((a, b) => {
        return a.instance.uid - b.instance.uid;
      });
  }

  /**
   * Get visible columns only
   */
  getVisibleColumns(): ColumnInstance[] {
    return this.getColumns().filter((col) => col.props.visible !== false);
  }

  /**
   * Get column by id
   */
  getColumnById(id: string): ColumnInstance | undefined {
    return this.getAll().find((col) => col.props.id === id);
  }

  /**
   * Get size of collection
   */
  get size(): number {
    return this.columns.size;
  }

  /**
   * Extract columns from VNode tree (alternative approach for slot parsing)
   * This recursively finds VcColumn vnodes in the default slot
   */
  static extractFromSlots(slots: Slots): VNode[] {
    const defaultSlot = slots.default?.();
    if (!defaultSlot) return [];

    const columnVNodes: VNode[] = [];

    const processVNode = (vnode: VNode) => {
      // Check if this is a VcColumn
      if (typeof vnode.type === "object" && (vnode.type as any).name === "VcColumn") {
        columnVNodes.push(vnode);
      }
      // Check for Fragment with children
      else if (Array.isArray(vnode.children)) {
        (vnode.children as VNode[]).forEach(processVNode);
      }
    };

    defaultSlot.forEach(processVNode);
    return columnVNodes;
  }

  private triggerUpdate(): void {
    this.updateCallback?.();
  }
}

export default ColumnCollector;
