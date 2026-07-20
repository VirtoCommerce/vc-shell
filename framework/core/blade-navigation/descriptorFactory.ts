import type { BladeDescriptor, BladeOpenEvent } from "@core/blade-navigation/types";

/**
 * Context passed to descriptor factories — the runtime dependencies each
 * factory needs to produce a fully-formed BladeDescriptor.
 * @internal
 */
export interface DescriptorFactoryContext {
  /** Generate a unique blade instance ID */
  generateId: () => string;
  /** Resolve a blade name to its URL segment (undefined if none) */
  resolveUrl: (name: string) => string | undefined;
}

/**
 * Build a workspace (root) descriptor.
 *
 * Workspace blades have no `parentId` and never carry a `param` when opened —
 * they are the root of a stack. Always visible.
 * @internal
 */
export function createWorkspaceDescriptor(event: BladeOpenEvent, ctx: DescriptorFactoryContext): BladeDescriptor {
  return {
    id: ctx.generateId(),
    name: event.name,
    url: ctx.resolveUrl(event.name),
    // workspace blades don't have param when opened first
    query: event.query,
    options: event.options,
    visible: true,
  };
}

/**
 * Build a child descriptor opened from a parent blade.
 *
 * The child's `parentId` is the blade it was opened from. Always visible.
 * @internal
 */
export function createChildDescriptor(
  event: BladeOpenEvent,
  parentId: string,
  ctx: DescriptorFactoryContext,
): BladeDescriptor {
  return {
    id: ctx.generateId(),
    name: event.name,
    url: ctx.resolveUrl(event.name),
    param: event.param,
    query: event.query,
    options: event.options,
    parentId,
    visible: true,
  };
}

/**
 * Build a replacement descriptor for `replaceCurrentBlade`.
 *
 * Keeps the SAME parent as the replaced blade so the new blade occupies the
 * exact same position in the hierarchy. Always visible.
 * @internal
 */
export function createReplacementDescriptor(
  event: BladeOpenEvent,
  replacedParentId: string | undefined,
  ctx: DescriptorFactoryContext,
): BladeDescriptor {
  return {
    id: ctx.generateId(),
    name: event.name,
    url: ctx.resolveUrl(event.name),
    param: event.param,
    query: event.query,
    options: event.options,
    parentId: replacedParentId,
    visible: true,
  };
}

/**
 * Build a covering descriptor for `coverCurrentBlade`.
 *
 * The covering blade's parent is the HIDDEN blade (not its parent), so
 * `callParent` from the covering blade reaches the hidden blade's methods.
 * Always visible.
 * @internal
 */
export function createCoveringDescriptor(
  event: BladeOpenEvent,
  hiddenBladeId: string,
  ctx: DescriptorFactoryContext,
): BladeDescriptor {
  return {
    id: ctx.generateId(),
    name: event.name,
    url: ctx.resolveUrl(event.name),
    param: event.param,
    query: event.query,
    options: event.options,
    parentId: hiddenBladeId,
    visible: true,
  };
}
