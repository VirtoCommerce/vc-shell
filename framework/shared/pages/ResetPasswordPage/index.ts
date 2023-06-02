import { createModule } from "./../../../core/plugins";
import * as components from "./components";
import * as locales from "./locales";

export const ResetPasswordPage = createModule(components, locales);

export * from "./components";
