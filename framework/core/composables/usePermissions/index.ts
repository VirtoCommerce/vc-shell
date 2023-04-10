import { useUser } from "./../useUser";
import { computed, ComputedRef } from "vue";

interface IUsePermissions {
  readonly userPermissions: ComputedRef<string[]>;
  checkPermission(permissions: string | string[]): boolean;
}

export function usePermissions(): IUsePermissions {
  const { user } = useUser();

  function checkPermission(permissions: string | string[] | undefined) {
    if (!permissions) {
      return true;
    } else if (permissions || (permissions && permissions instanceof Array)) {
      if (typeof permissions === "string") {
        return user.value?.permissions.includes(permissions);
      } else if (permissions.length > 0) {
        return user.value?.permissions.some((role) => {
          return permissions.includes(role);
        });
      }
    } else {
      console.error("Permissions must be a string or strings array");
    }
  }

  return {
    userPermissions: computed(() => user.value?.permissions),
    checkPermission,
  };
}
