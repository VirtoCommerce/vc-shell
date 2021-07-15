interface IShellOptions {
  extensions: import("vue").Plugin[];
  locale?: string;
}

declare module "@virtocommerce/shell" {
  export const install: import("vue").PluginInstallFunction;
}
