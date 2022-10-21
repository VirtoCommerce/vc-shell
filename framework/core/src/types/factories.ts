import {
  IdentityResult,
  PushNotification,
  PushNotificationSearchResult,
  SecurityResult,
  SettingClient,
  UserDetail,
} from "@vc-shell/api-client";

interface IUseUserFactoryParams {
  validateToken: (userId: string, token: string) => Promise<boolean>;
  validatePassword: (password: string) => Promise<IdentityResult>;
  resetPasswordByToken: (
    userId: string,
    password: string,
    token: string
  ) => Promise<SecurityResult>;
  loadUser: () => Promise<UserDetail>;
  requestPasswordReset: (loginOrEmail: string) => Promise<void>;
  changeUserPassword: (
    oldPassword: string,
    newPassword: string,
    token: string
  ) => Promise<SecurityResult>;
  setAuthToken: (token: string) => void;
  getCurrentUser: () => Promise<UserDetail>;
}

interface IUseNotificationsFactoryParams {
  setAuthToken: (token: string) => void;
  getPushNotifications: (
    token: string,
    take: number
  ) => Promise<PushNotification[]>;
  markAllAsRead: () => Promise<PushNotificationSearchResult>;
}

interface IUseSettingsFactoryParams {
  getApiClient: (token: string) => SettingClient;
}

export type {
  IUseUserFactoryParams,
  IUseNotificationsFactoryParams,
  IUseSettingsFactoryParams,
};
