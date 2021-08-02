/* eslint-disable */
declare module "@virtoshell/ui" {
  export const install: import("vue").PluginInstallFunction;

  /* Atoms */
  export const VcBreadcrumbs: import("vue").DefineComponent<{}, {}, any>;
  export const VcButton: import("vue").DefineComponent<{}, {}, any>;
  export const VcCheckbox: import("vue").DefineComponent<{}, {}, any>;
  export const VcContainer: import("vue").DefineComponent<{}, {}, any>;
  export const VcIcon: import("vue").DefineComponent<{}, {}, any>;
  export const VcInput: import("vue").DefineComponent<{}, {}, any>;
  export const VcLink: import("vue").DefineComponent<{}, {}, any>;
  export const VcLoading: import("vue").DefineComponent<{}, {}, any>;
  export const VcSpacer: import("vue").DefineComponent<{}, {}, any>;

  /* Molecules */
  export const VcDrawerItem: import("vue").DefineComponent<{}, {}, any>;
  export const VcDrawerToggler: import("vue").DefineComponent<{}, {}, any>;

  /* Organisms */
  export const VcBlade: import("vue").DefineComponent<{}, {}, any>;
  export const VcDrawer: import("vue").DefineComponent<{}, {}, any>;
  export const VcLayout: import("vue").DefineComponent<{}, {}, any>;
  export const VcTable: import("vue").DefineComponent<{}, {}, any>;

  /* Pages */
  export const VcLoginPage: import("vue").DefineComponent<{}, {}, any>;
  export const VcNotfoundPage: import("vue").DefineComponent<{}, {}, any>;
  export const VcWorkspacePage: import("vue").DefineComponent<{}, {}, any>;
};
