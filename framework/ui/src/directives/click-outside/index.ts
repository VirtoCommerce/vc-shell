import { Directive, DirectiveBinding } from "vue";

interface OutsideClickableHTMLElement extends HTMLElement {
  _outsideClickHandler: (event: MouseEvent | TouchEvent) => void;
}

export default {
  mounted(el: OutsideClickableHTMLElement, binding: DirectiveBinding): void {
    const closeHandler = binding.value;
    el._outsideClickHandler = function (event: MouseEvent | TouchEvent) {
      if (!el.contains(event.target as Node)) {
        event.stopPropagation();
        closeHandler();
      }
    };
    document.addEventListener("click", el._outsideClickHandler);
  },
  unmounted(el: OutsideClickableHTMLElement): void {
    document.removeEventListener("click", el._outsideClickHandler);
  },
} as Directive;
