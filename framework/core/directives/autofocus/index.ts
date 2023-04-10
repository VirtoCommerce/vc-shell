import { Directive, DirectiveBinding } from "vue";

export const autofocus = {
  mounted(el: HTMLElement, binding: DirectiveBinding): void {
    if (binding.value) {
      el.focus();
    }
  },
} as Directive;
