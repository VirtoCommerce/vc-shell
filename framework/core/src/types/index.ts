export interface AuthData {
  accessToken?: string;
  //alias for accessToken is used by platform and is required for sharing auth data between platform and custom apps
  token?: string;
  refreshToken?: string;
  userName?: string;
  expiresAt?: number;
}

export interface SignInResult {
  succeeded: boolean;
  error?: string;
  errorCode?: string;
}

export interface RequestPasswordResult {
  succeeded: boolean;
  error?: string;
  errorCode?: string;
}
