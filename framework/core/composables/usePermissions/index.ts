import { useUserManagement } from "@core/composables/useUserManagement";

export interface UsePermissionsReturn {
  hasAccess(permissions: string | string[] | undefined): boolean;
}

/** @deprecated Use UsePermissionsReturn instead */
export type IUsePermissions = UsePermissionsReturn;

export function usePermissions(): UsePermissionsReturn {
  const { user } = useUserManagement();

  function hasAccess(permissions: string | string[] | undefined) {
    const userPermissions = user.value?.permissions ?? [];

    if (!permissions || user.value?.isAdministrator) {
      return true;
    } else if (Array.isArray(permissions)) {
      return permissions.some((permission) => userPermissions.includes(permission));
    } else if (typeof permissions === "string") {
      return userPermissions.includes(permissions);
    } else {
      throw new Error("Permissions must be a string or an array of strings");
    }
  }

  return {
    hasAccess,
  };
}
