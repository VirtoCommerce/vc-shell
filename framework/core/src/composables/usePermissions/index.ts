import useUser from "../useUser";
import { computed, ComputedRef } from "vue";

interface IUsePermissions {
  readonly userPermissions: ComputedRef<string[]>;
  checkPermission(args: { permissions: string[] }): boolean;
}

export default (): IUsePermissions => {
  const { user } = useUser();

  function checkPermission(args: { permissions: string[] }) {
    if (args.permissions && args.permissions instanceof Array) {
      if (args.permissions.length > 0) {
        const permissionRoles = args.permissions;

        return user.value?.permissions.some((role) => {
          return permissionRoles.includes(role);
        });
      }
    } else {
      console.error("Roles must be an array");
    }
  }

  return {
    userPermissions: computed(() => user.value?.permissions),
    checkPermission,
  };
};
