export interface CommonPageComposables {
  useLogin?(): {
    forgotPassword: (args: { loginOrEmail: string }) => void;
  };
}
