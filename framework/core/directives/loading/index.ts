import { DirectiveBinding } from "vue";
import "./styles.css";

export const loading = (el: HTMLElement, binding: DirectiveBinding) => {
  const zIndex = binding.arg ? parseInt(binding.arg, 10) : 9999;
  if (binding.value) {
    el.classList.add("v-loading");
    el.style.setProperty("--v-loading-z-index", `${zIndex}`);
  } else {
    el.classList.remove("v-loading");
    el.style.removeProperty("--v-loading-z-index");
  }
};
