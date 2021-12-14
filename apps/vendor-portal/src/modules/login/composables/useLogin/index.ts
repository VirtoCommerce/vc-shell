import { computed, Ref, ref, ComputedRef } from "vue";
import {
  VcmpSellerSecurityClient,
  ResetPasswordCommand,
  ForgotPasswordCommand,
  IdentityResult,
} from "../../../../api_client";

interface IUseLogin {
  forgotPassword: (args: { loginOrEmail: string }) => void;
  resetPassword: (cmd: ResetPasswordCommand) => Promise<IdentityResult>;
}

export default (): IUseLogin => {
  async function getApiClient(): Promise<VcmpSellerSecurityClient> {
    const client = new VcmpSellerSecurityClient();
    return client;
  }

  async function forgotPassword(args: { loginOrEmail: string }) {
    const client = await getApiClient();
    await client.forgotPassword({
      loginOrEmail: args.loginOrEmail,
    } as ForgotPasswordCommand);
  }

  async function resetPassword(
    cmd: ResetPasswordCommand
  ): Promise<IdentityResult> {
    const client = await getApiClient();
    return client.resetPasswordByToken(cmd);
  }

  return {
    forgotPassword,
    resetPassword,
  };
};
