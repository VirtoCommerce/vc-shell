import { Ref, onMounted, ref } from "vue";
import { useUser } from "./../useUser";

interface IUsePermissions {
  hasAccess(permissions: string | string[]): boolean;
}
const userPermissions: Ref<string[]> = ref([]);
export function usePermissions(): IUsePermissions {
  const { user } = useUser();

  if (user.value) {
    userPermissions.value = user.value?.permissions;
  }

  function hasAccess(permissions: string | string[] | undefined) {
    if (!permissions) {
      return true;
    } else if (permissions || (permissions && permissions instanceof Array)) {
      if (typeof permissions === "string") {
        return userPermissions.value?.includes(permissions);
      } else if (permissions.length > 0) {
        return userPermissions.value?.some((role) => {
          return permissions.includes(role);
        });
      }
    } else {
      throw new Error("Permissions must be a string or strings array");
    }
  }

  return {
    hasAccess,
  };
}
