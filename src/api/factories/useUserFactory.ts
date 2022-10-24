import {
  ResetPasswordConfirmRequest,
  SecurityClient,
  ValidatePasswordResetTokenRequest,
} from "@vc-shell/api-client";
import { IUseUserFactoryParams } from "@vc-shell/core";

const securityClient = new SecurityClient();

const useUserFactory = (): IUseUserFactoryParams => {
  const validateToken = async (userId: string, token: string) => {
    return securityClient.validatePasswordResetToken(
      userId,
      new ValidatePasswordResetTokenRequest({ token })
    );
  };

  const validatePassword = async (password: string) => {
    return securityClient.validatePassword(password);
  };

  const resetPasswordByToken = async (
    userId: string,
    password: string,
    token: string
  ) => {
    return securityClient.resetPasswordByToken(
      userId,
      new ResetPasswordConfirmRequest({ newPassword: password, token })
    );
  };

  const loadUser = async () => {
    return securityClient.getCurrentUser();
  };

  const requestPasswordReset = async (loginOrEmail: string) => {
    return securityClient.requestPasswordReset(loginOrEmail);
  };

  const changeUserPassword = async (
    oldPassword: string,
    newPassword: string,
    token: string
  ) => {
    const res = await fetch(
      "/api/platform/security/currentuser/changepassword",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json-patch+json",
          Accept: "text/plain",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      }
    );
    if (res.status !== 500) {
      return await res.text().then((response) => {
        return JSON.parse(response);
      });
    }
  };

  const setAuthToken = (token: string) => {
    return securityClient.setAuthToken(token);
  };

  const getCurrentUser = () => {
    return securityClient.getCurrentUser();
  };

  return {
    validateToken,
    validatePassword,
    resetPasswordByToken,
    loadUser,
    requestPasswordReset,
    changeUserPassword,
    setAuthToken,
    getCurrentUser,
  };
};

export default useUserFactory;
