import { Directive, DirectiveBinding } from "vue";

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding): void {
    if (binding.value) {
      el.focus();
    }
  },
} as Directive;
