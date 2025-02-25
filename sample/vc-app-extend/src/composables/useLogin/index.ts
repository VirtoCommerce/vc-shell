/* eslint-disable @typescript-eslint/no-unused-vars */
interface IUseLogin {
  forgotPassword: (args: { loginOrEmail: string }) => void;
}

export default (): IUseLogin => {
  /**
   * @description Forgot password functionality
   */
  async function forgotPassword(args: { loginOrEmail: string }) {
    console.log("Forgot password click");
  }

  return {
    forgotPassword,
  };
};
