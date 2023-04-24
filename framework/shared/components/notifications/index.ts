import * as components from "./components";
import { createModule } from "../../../core/plugins";
import "./styles/index.scss";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    VcNotificationContainer: (typeof components)["NotificationContainer"];
  }
}

export const VcNotificationComponent = createModule(components);

export * from "./components";
export * from "./composables";
export * from "./types";
export * from "./core";
