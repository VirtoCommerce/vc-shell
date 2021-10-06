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
    document.addEventListener("mousedown", el._outsideClickHandler);
    document.addEventListener("touchstart", el._outsideClickHandler);
  },
  unmounted(el: OutsideClickableHTMLElement): void {
    document.removeEventListener("mousedown", el._outsideClickHandler);
    document.removeEventListener("touchstart", el._outsideClickHandler);
  },
} as Directive;
