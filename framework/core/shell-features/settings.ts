import { LanguageSelector } from "../../shared/components/language-selector";
import { ThemeSelector } from "../../shared/components/theme-selector";
import { ChangePasswordButton } from "../../shared/components/change-password-button";
import { LogoutButton } from "../../shared/components/logout-button";
import type { ShellFeature } from "../types/shell-feature";

export const settingsFeature: ShellFeature = {
  id: "settings",
  settingsMenuItems: [
    { id: "theme-selector", component: ThemeSelector, order: 10 },
    { id: "language-selector", component: LanguageSelector, order: 20 },
    { id: "change-password", component: ChangePasswordButton, order: 30 },
    { id: "logout", component: LogoutButton, order: 100 },
  ],
};
