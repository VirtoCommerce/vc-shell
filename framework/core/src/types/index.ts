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
