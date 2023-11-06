interface IUseLogin {
  forgotPassword: (args: { loginOrEmail: string }) => void;
}

export default (): IUseLogin => {
  /**
   * @description Forgot password functionality
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function forgotPassword(args: { loginOrEmail: string }) {
    console.log("Forgot password click");
  }

  return {
    forgotPassword,
  };
};
