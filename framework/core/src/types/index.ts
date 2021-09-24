export interface AuthData {
  accessToken?: string;
  refreshToken?: string;
  userName?: string;
  expiresAt?: number;
}

export interface SignInResult {
  succeeded: boolean;
  error?: string;
  errorCode?: string;
}

export interface IBladeData {
  name: string;
  component?: unknown;
  uid?: string;
  url?: string;
  param?: string;
  componentOptions?: Record<string, unknown>;
  expanded?: boolean;
  closable?: boolean;
}
