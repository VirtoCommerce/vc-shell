import { Directive, DirectiveBinding } from "vue";
import { usePermissions } from "../../composables";
const { checkPermission } = usePermissions();

function checkAndRemove(el: HTMLElement, binding: DirectiveBinding) {
  const { value: permissions } = binding;
  const result = checkPermission(permissions);
  if (result === false) {
    el.parentNode && el.parentNode.removeChild(el);
  }
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding): void {
    checkAndRemove(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding): void {
    checkAndRemove(el, binding);
  },
} as Directive;
