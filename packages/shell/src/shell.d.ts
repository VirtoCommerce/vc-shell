interface IShellOptions {
  extensions: import("vue").Plugin[];
}

declare module "@virtocommerce/shell" {
  export const install: import("vue").PluginInstallFunction;
}
