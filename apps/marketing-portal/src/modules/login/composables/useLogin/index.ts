import {
  VcmpSellerSecurityClient,
  ForgotPasswordCommand,
} from "../../../../api_client";

interface IUseLogin {
  forgotPassword: (args: { loginOrEmail: string }) => void;
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

  return {
    forgotPassword,
  };
};
