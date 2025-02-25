import { DirectiveBinding } from "vue";
import "./styles.css";

interface LoadingOptions {
  size?: "small" | "medium" | "large";
  color?: string;
  blur?: boolean;
  fullscreen?: boolean;
}

export const loading = (el: HTMLElement, binding: DirectiveBinding) => {
  const zIndex = binding.arg ? parseInt(binding.arg, 10) : 9999;

  const options: LoadingOptions = typeof binding.value === "object" ? binding.value : { blur: true };

  if (binding.value) {
    el.classList.add("v-loading");

    if (options.size) {
      el.setAttribute("data-loading-size", options.size);
    }

    if (options.color) {
      el.style.setProperty("--v-loading-spinner-color", options.color);
    }

    if (options.blur === false) {
      el.classList.add("v-loading--no-blur");
    }

    if (options.fullscreen) {
      el.classList.add("v-loading--fullscreen");
    }

    el.style.setProperty("--v-loading-z-index", `${zIndex}`);
  } else {
    el.classList.remove("v-loading", "v-loading--no-blur", "v-loading--fullscreen");
    el.removeAttribute("data-loading-size");
    el.style.removeProperty("--v-loading-z-index");
    el.style.removeProperty("--v-loading-spinner-color");
  }
};
