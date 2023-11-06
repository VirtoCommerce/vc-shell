import * as VcShellComponents from "./../components";

// Declare all components globally
declare module "vue" {
  export interface GlobalComponents {
    // atoms
    VcBadge: (typeof VcShellComponents)["VcBadge"];
    VcButton: (typeof VcShellComponents)["VcButton"];
    VcCard: (typeof VcShellComponents)["VcCard"];
    VcCheckbox: (typeof VcShellComponents)["VcCheckbox"];
    VcCol: (typeof VcShellComponents)["VcCol"];
    VcContainer: (typeof VcShellComponents)["VcContainer"];
    VcHint: (typeof VcShellComponents)["VcHint"];
    VcIcon: (typeof VcShellComponents)["VcIcon"];
    VcImage: (typeof VcShellComponents)["VcImage"];
    VcInfoRow: (typeof VcShellComponents)["VcInfoRow"];
    VcLabel: (typeof VcShellComponents)["VcLabel"];
    VcLink: (typeof VcShellComponents)["VcLink"];
    VcLoading: (typeof VcShellComponents)["VcLoading"];
    VcProgress: (typeof VcShellComponents)["VcProgress"];
    VcRow: (typeof VcShellComponents)["VcRow"];
    VcStatus: (typeof VcShellComponents)["VcStatus"];
    VcStatusIcon: (typeof VcShellComponents)["VcStatusIcon"];
    VcSwitch: (typeof VcShellComponents)["VcSwitch"];
    VcWidget: (typeof VcShellComponents)["VcWidget"];

    // molecules
    VcBreadcrumbs: (typeof VcShellComponents)["VcBreadcrumbs"];
    VcCodeEditor: (typeof VcShellComponents)["VcCodeEditor"];
    VcEditor: (typeof VcShellComponents)["VcEditor"];
    VcFileUpload: (typeof VcShellComponents)["VcFileUpload"];
    VcForm: (typeof VcShellComponents)["VcForm"];
    VcInput: (typeof VcShellComponents)["VcInput"];
    VcInputCurrency: (typeof VcShellComponents)["VcInputCurrency"];
    VcNotification: (typeof VcShellComponents)["VcNotification"];
    VcPagination: (typeof VcShellComponents)["VcPagination"];
    VcRating: (typeof VcShellComponents)["VcRating"];
    VcSelect: (typeof VcShellComponents)["VcSelect"];
    VcSlider: (typeof VcShellComponents)["VcSlider"];
    VcTextarea: (typeof VcShellComponents)["VcTextarea"];
    VcMultivalue: (typeof VcShellComponents)["VcMultivalue"];
    VcField: (typeof VcShellComponents)["VcField"];

    // organisms
    VcApp: (typeof VcShellComponents)["VcApp"];
    VcBlade: (typeof VcShellComponents)["VcBlade"];
    VcDynamicProperty: (typeof VcShellComponents)["VcDynamicProperty"];
    VcGallery: (typeof VcShellComponents)["VcGallery"];
    VcLoginForm: (typeof VcShellComponents)["VcLoginForm"];
    VcPopup: (typeof VcShellComponents)["VcPopup"];
    VcTable: (typeof VcShellComponents)["VcTable"];
    VcNotificationDropdown: (typeof VcShellComponents)["VcNotificationDropdown"];
    VcNotificationTemplate: (typeof VcShellComponents)["VcNotificationTemplate"];
  }
}

export {};
