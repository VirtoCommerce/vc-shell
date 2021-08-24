import VcLoader from "./vc-loader.vue";
import { createApp, App, ComponentPublicInstance } from "vue";

interface ILoader {
  loadingInstance: App;
  loadEl: ComponentPublicInstance;
  show(): void;
  isVisible(): boolean;
  hide(): void;
}

interface ILoaderProps {
  active: boolean;
}

class Loader implements ILoader {
  loadingInstance = createApp(VcLoader);
  loadEl: ComponentPublicInstance;

  constructor() {
    const el = this.loadingInstance.mount(document.createElement("div"));
    document.body.appendChild(el.$el);
    this.loadEl = el;
  }

  show() {
    (this.loadEl.$data as ILoaderProps).active = true;
  }

  isVisible(): boolean {
    return (this.loadEl.$data as ILoaderProps).active;
  }

  hide() {
    (this.loadEl.$data as ILoaderProps).active = false;
  }
}

const instance = new Loader();
export default instance;
