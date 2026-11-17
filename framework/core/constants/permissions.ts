/**
 * Platform permissions the framework checks itself. Internal: not re-exported from
 * `@core/constants`; apps pass their own permission strings as data.
 */
export const PlatformPermissions = {
  AssetCreate: "platform:asset:create",
  AssetDelete: "platform:asset:delete",
} as const;
