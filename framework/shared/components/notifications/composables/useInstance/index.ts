import { App, Ref, ref } from "vue";
import { useContainer } from "./../useContainer";

interface IUseInstance {
  saveInstance(app: App<Element>, id: string): void;
  unmountComponent(): void;
  clearContainer(): void;
}

const containerInstance: Ref<App<Element> | undefined> = ref();

export function useInstance(): IUseInstance {
  const { pending, notificationContainer } = useContainer();

  function saveInstance(app: App<Element>, id: string) {
    const container = document.getElementById(id);
    if (container) {
      containerInstance.value = app;
    }
  }

  function unmountComponent() {
    try {
      containerInstance.value?.unmount();
      document.getElementById("notification")?.remove();
      containerInstance.value = undefined;
      notificationContainer.value = [];
    } catch (error) {
      console.error(error);
    }
  }

  function clearContainer() {
    if (containerInstance.value) {
      unmountComponent();
    }

    pending.items = [];
  }

  return {
    saveInstance,
    unmountComponent,
    clearContainer,
  };
}
