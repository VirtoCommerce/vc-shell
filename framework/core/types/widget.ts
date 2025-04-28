import { Component } from "vue";

export interface IWidget {
  id: string;
  title?: string;
  component: Component;
  isVisible?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events?: Record<string, any>;
}

export interface IWidgetRegistration extends IWidget {
  bladeId: string;
}
