import { Directive, DirectiveBinding } from "vue";

const className = "v-loading";

export default {
  mounted: function (el: HTMLElement, binding: DirectiveBinding): void {
    console.log("v-loading mount");
    const loader = document.createElement("div");
    loader.className = className;
    loader.innerHTML = "Loading...";
    loader.style.display = binding.value ? "flex" : "none";
    loader.style.position = "absolute";
    loader.style.alignItems = "center";
    loader.style.justifyContent = "center";
    loader.style.background = "rgba(255, 255, 255, 0.75)";
    loader.style.zIndex = "9999";
    loader.style.width = "100%";
    loader.style.height = "100%";
    el.appendChild(loader);
  },
  updated: function (el: HTMLElement, binding: DirectiveBinding): void {
    console.log("v-loading updated");
    const loader = el.querySelector(`.${className}`) as HTMLElement;
    if (loader) {
      loader.style.display = binding.value ? "flex" : "none";
    }
  },
} as Directive;
