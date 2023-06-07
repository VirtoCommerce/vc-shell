import { Ref, ref } from "vue";
import { useUser } from "./../useUser";

interface IUsePermissions {
  checkPermission(permissions: string | string[]): boolean;
  fetchUserPermissions(): Promise<void>;
}
const userPermissions: Ref<string[]> = ref([]);
export function usePermissions(): IUsePermissions {
  const { user, loadUser } = useUser();

  async function fetchUserPermissions() {
    if (user.value?.permissions) {
      userPermissions.value = user.value?.permissions;
    } else {
      try {
        const userData = await loadUser();
        userPermissions.value = userData.permissions;
      } catch (e) {
        throw new Error("Unable to load user permissions");
      }
    }
  }

  function checkPermission(permissions: string | string[] | undefined) {
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
    checkPermission,
    fetchUserPermissions,
  };
}
