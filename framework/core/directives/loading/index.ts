import { DirectiveBinding } from "vue";
import "./styles.css";

export const loading = (el: HTMLElement, binding: DirectiveBinding) => {
  el.classList[binding.value ? "add" : "remove"]("v-loading");
};
