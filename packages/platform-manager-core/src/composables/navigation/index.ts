import { App, Component, Ref, ref } from "vue";

interface IRouteData {
  id: number;
  component: Component;
  componentOptions: Record<string, unknown>;
}

export const current: Ref<IRouteData[]> = ref([]);

export function clear(): void {
  current.value.slice();
}

export function push(app: App, route: IRouteData): void {
  current.value.push(route);
}

export function pop(): IRouteData | undefined {
  return current.value.pop();
}
