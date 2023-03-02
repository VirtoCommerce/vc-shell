import { GlobalComponentConstructor } from "./ts-helpers";
import {
  VcInputProps,
  VcInputSlots,
} from "../components/molecules/vc-input/vc-input-model";
import {
  VcSelectProps,
  VcSelectSlots,
} from "../components/molecules/vc-select/vc-select-model";
import {
  VcInputCurrencyProps,
  VcInputCurrencySlots,
} from "../components/molecules/vc-input-currency/vc-input-currency-model";
import {
  VcBadgeProps,
  VcBadgeSlots,
} from "../components/atoms/vc-badge/vc-badge-model";
import {
  VcButtonProps,
  VcButtonSlots,
} from "../components/atoms/vc-button/vc-button-model";
import {
  VcCardProps,
  VcCardSlots,
} from "../components/atoms/vc-card/vc-card-model";
import {
  VcCheckboxProps,
  VcCheckboxSlots,
} from "../components/atoms/vc-checkbox/vc-checkbox-model";
import {
  VcColProps,
  VcColSlots,
} from "../components/atoms/vc-col/vc-col-model";
import {
  VcContainerProps,
  VcContainerSlots,
} from "../components/atoms/vc-container/vc-container-model";
import {
  VcIconProps,
  VcIconSlots,
} from "../components/atoms/vc-icon/vc-icon-model";
import {
  VcImageProps,
  VcImageSlots,
} from "../components/atoms/vc-image/vc-image-model";
import {
  VcInfoRowProps,
  VcInfoRowSlots,
} from "../components/atoms/vc-info-row/vc-info-row-model";
import {
  VcLabelProps,
  VcLabelSlots,
} from "../components/atoms/vc-label/vc-label-model";
import {
  VcLinkProps,
  VcLinkSlots,
} from "../components/atoms/vc-link/vc-link-model";
import {
  VcLoadingProps,
  VcLoadingSlots,
} from "../components/atoms/vc-loading/vc-loading-model";
import {
  VcProgressProps,
  VcProgressSlots,
} from "../components/atoms/vc-progress/vc-progress-model";
import { VcRowSlots } from "../components/atoms/vc-row/vc-row-model";
import {
  VcStatusProps,
  VcStatusSlots,
} from "../components/atoms/vc-status/vc-status-model";
import {
  VcStatusIconProps,
  VcStatusIconSlots,
} from "../components/atoms/vc-status-icon/vc-status-icon-model";
import {
  VcSwitchProps,
  VcSwitchSlots,
} from "../components/atoms/vc-switch/vc-switch-model";
import {
  VcWidgetProps,
  VcWidgetSlots,
} from "../components/atoms/vc-widget/vc-widget-model";
import {
  VcBreadcrumbsProps,
  VcBreadcrumbsSlots,
} from "../components/molecules/vc-breadcrumbs/vc-breadcrumbs-model";
import {
  VcEditorProps,
  VcEditorSlots,
} from "../components/molecules/vc-editor/vc-editor-model";
import {
  VcFileUploadProps,
  VcFileUploadSlots,
} from "../components/molecules/vc-file-upload/vc-file-upload-model";
import {
  VcNotificationProps,
  VcNotificationSlots,
} from "../components/molecules/vc-notification/vc-notification-model";
import {
  VcPaginationProps,
  VcPaginationSlots,
} from "../components/molecules/vc-pagination/vc-pagination-model";
import {
  VcRatingProps,
  VcRatingSlots,
} from "../components/molecules/vc-rating/vc-rating-model";
import {
  VcSliderProps,
  VcSliderSlots,
} from "../components/molecules/vc-slider/vc-slider-model";
import {
  VcTextareaProps,
  VcTextareaSlots,
} from "../components/molecules/vc-textarea/vc-textarea-model";
import {
  VcAppProps,
  VcAppSlots,
} from "../components/organisms/vc-app/vc-app-model";
import {
  VcBladeProps,
  VcBladeSlots,
} from "../components/organisms/vc-blade/vc-blade-model";
import {
  VcDynamicPropertyProps,
  VcDynamicPropertySlots,
} from "../components/organisms/vc-dynamic-property/vc-dynamic-property-model";
import {
  VcGalleryProps,
  VcGallerySlots,
} from "../components/organisms/vc-gallery/vc-gallery-model";
import {
  VcLoginFormProps,
  VcLoginFormSlots,
} from "../components/organisms/vc-login-form/vc-login-form-model";
import {
  VcPopupProps,
  VcPopupSlots,
} from "../components/organisms/vc-popup/vc-popup-model";
import {
  VcTableProps,
  VcTableSlots,
} from "../components/organisms/vc-table/vc-table-model";

declare module "@vue/runtime-core" {
  interface GlobalComponents {
    // atoms
    VcBadge: GlobalComponentConstructor<VcBadgeProps, VcBadgeSlots>;
    VcButton: GlobalComponentConstructor<VcButtonProps, VcButtonSlots>;
    VcCard: GlobalComponentConstructor<VcCardProps, VcCardSlots>;
    VcCheckbox: GlobalComponentConstructor<VcCheckboxProps, VcCheckboxSlots>;
    VcCol: GlobalComponentConstructor<VcColProps, VcColSlots>;
    VcContainer: GlobalComponentConstructor<VcContainerProps, VcContainerSlots>;
    VcHint: GlobalComponentConstructor;
    VcIcon: GlobalComponentConstructor<VcIconProps, VcIconSlots>;
    VcImage: GlobalComponentConstructor<VcImageProps, VcImageSlots>;
    VcInfoRow: GlobalComponentConstructor<VcInfoRowProps, VcInfoRowSlots>;
    VcLabel: GlobalComponentConstructor<VcLabelProps, VcLabelSlots>;
    VcLink: GlobalComponentConstructor<VcLinkProps, VcLinkSlots>;
    VcLoading: GlobalComponentConstructor<VcLoadingProps, VcLoadingSlots>;
    VcProgress: GlobalComponentConstructor<VcProgressProps, VcProgressSlots>;
    VcRow: GlobalComponentConstructor<any, VcRowSlots>;
    VcStatus: GlobalComponentConstructor<VcStatusProps, VcStatusSlots>;
    VcStatusIcon: GlobalComponentConstructor<
      VcStatusIconProps,
      VcStatusIconSlots
    >;
    VcSwitch: GlobalComponentConstructor<VcSwitchProps, VcSwitchSlots>;
    VcWidget: GlobalComponentConstructor<VcWidgetProps, VcWidgetSlots>;

    // molecules
    VcBreadcrumbs: GlobalComponentConstructor<
      VcBreadcrumbsProps,
      VcBreadcrumbsSlots
    >;
    VcEditor: GlobalComponentConstructor<VcEditorProps, VcEditorSlots>;
    VcFileUpload: GlobalComponentConstructor<
      VcFileUploadProps,
      VcFileUploadSlots
    >;
    VcForm: GlobalComponentConstructor;
    VcInput: GlobalComponentConstructor<VcInputProps, VcInputSlots>;
    VcInputCurrency: GlobalComponentConstructor<
      VcInputCurrencyProps,
      VcInputCurrencySlots
    >;
    VcNotification: GlobalComponentConstructor<
      VcNotificationProps,
      VcNotificationSlots
    >;
    VcPagination: GlobalComponentConstructor<
      VcPaginationProps,
      VcPaginationSlots
    >;
    VcRating: GlobalComponentConstructor<VcRatingProps, VcRatingSlots>;
    VcSelect: GlobalComponentConstructor<VcSelectProps, VcSelectSlots>;
    VcSlider: GlobalComponentConstructor<VcSliderProps, VcSliderSlots>;
    VcTextarea: GlobalComponentConstructor<VcTextareaProps, VcTextareaSlots>;

    // organisms
    VcApp: GlobalComponentConstructor<VcAppProps, VcAppSlots>;
    VcBlade: GlobalComponentConstructor<VcBladeProps, VcBladeSlots>;
    VcDynamicProperty: GlobalComponentConstructor<
      VcDynamicPropertyProps,
      VcDynamicPropertySlots
    >;
    VcGallery: GlobalComponentConstructor<VcGalleryProps, VcGallerySlots>;
    VcLoginForm: GlobalComponentConstructor<VcLoginFormProps, VcLoginFormSlots>;
    VcPopup: GlobalComponentConstructor<VcPopupProps, VcPopupSlots>;
    VcTable: GlobalComponentConstructor<VcTableProps, VcTableSlots>;
  }
}

export {};
