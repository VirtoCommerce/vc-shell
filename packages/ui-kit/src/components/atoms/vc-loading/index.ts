import VcLoading from './vc-loading.vue';
import { createApp, App, ComponentPublicInstance } from 'vue';

interface ILoading {
  loadingInstance: App;
  loadEl: ComponentPublicInstance;
  show(): void;
  isVisible(): boolean;
  hide(): void;
}

interface ILoadingProps {
  active: boolean;
}

class Loading implements ILoading {
  loadingInstance = createApp(VcLoading);
  loadEl: ComponentPublicInstance;

  constructor() {
    const el = this.loadingInstance.mount(document.createElement('div'))
    document.body.appendChild(el.$el)
    this.loadEl = el
  }

  show() {
    (this.loadEl.$data as ILoadingProps).active = true;
  }

  isVisible(): boolean {
    return (this.loadEl.$data as ILoadingProps).active;
  }

  hide() {
    (this.loadEl.$data as ILoadingProps).active = false;
  }
}

const instance = new Loading();
export default instance;
