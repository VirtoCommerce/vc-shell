import { Ref, ref } from "vue";
import { useUserManagement } from "./../useUserManagement";

interface IUsePermissions {
  hasAccess(permissions: string | string[] | undefined): boolean;
}
const userPermissions: Ref<string[]> = ref([]);
export function usePermissions(): IUsePermissions {
  const { user } = useUserManagement();

  if (user.value) {
    userPermissions.value = user.value?.permissions ?? [];
  }

  function hasAccess(permissions: string | string[] | undefined) {
    if (!permissions || user.value?.isAdministrator) {
      return true;
    } else if (Array.isArray(permissions)) {
      return permissions.some((permission) => userPermissions.value.includes(permission));
    } else if (typeof permissions === "string") {
      return userPermissions.value.includes(permissions);
    } else {
      throw new Error("Permissions must be a string or an array of strings");
    }
  }

  return {
    hasAccess,
  };
}
