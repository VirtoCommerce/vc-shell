/* eslint-disable @typescript-eslint/no-explicit-any */
import { GlobalComponentConstructor } from "./ts-helpers";
import { VcInputProps, VcInputSlots, VcInputEmits } from "../components/molecules/vc-input/vc-input-model";
import { VcSelectEmits, VcSelectProps, VcSelectSlots } from "../components/molecules/vc-select/vc-select-model";
import {
  VcInputCurrencyProps,
  VcInputCurrencySlots,
  VcInputCurrencyEmits,
} from "../components/molecules/vc-input-currency/vc-input-currency-model";
import { VcBadgeEmits, VcBadgeProps, VcBadgeSlots } from "../components/atoms/vc-badge/vc-badge-model";
import { VcButtonProps, VcButtonSlots, VcButtonEmits } from "../components/atoms/vc-button/vc-button-model";
import { VcCardProps, VcCardSlots, VcCardEmits } from "../components/atoms/vc-card/vc-card-model";
import { VcCheckboxProps, VcCheckboxSlots, VcCheckboxEmits } from "../components/atoms/vc-checkbox/vc-checkbox-model";
import { VcColProps, VcColSlots } from "../components/atoms/vc-col/vc-col-model";
import {
  VcContainerProps,
  VcContainerSlots,
  VcContainerEmits,
} from "../components/atoms/vc-container/vc-container-model";
import { VcIconProps, VcIconSlots } from "../components/atoms/vc-icon/vc-icon-model";
import { VcImageProps, VcImageSlots, VcImageEmits } from "../components/atoms/vc-image/vc-image-model";
import { VcInfoRowProps, VcInfoRowSlots } from "../components/atoms/vc-info-row/vc-info-row-model";
import { VcLabelProps, VcLabelSlots } from "../components/atoms/vc-label/vc-label-model";
import { VcLinkProps, VcLinkSlots, VcLinkEmits } from "../components/atoms/vc-link/vc-link-model";
import { VcLoadingProps, VcLoadingSlots } from "../components/atoms/vc-loading/vc-loading-model";
import { VcProgressProps, VcProgressSlots } from "../components/atoms/vc-progress/vc-progress-model";
import { VcRowSlots } from "../components/atoms/vc-row/vc-row-model";
import { VcStatusProps, VcStatusSlots } from "../components/atoms/vc-status/vc-status-model";
import { VcStatusIconProps, VcStatusIconSlots } from "../components/atoms/vc-status-icon/vc-status-icon-model";
import { VcSwitchProps, VcSwitchSlots, VcSwitchEmits } from "../components/atoms/vc-switch/vc-switch-model";
import { VcWidgetProps, VcWidgetSlots, VcWidgetEmits } from "../components/atoms/vc-widget/vc-widget-model";
import { VcBreadcrumbsProps, VcBreadcrumbsSlots } from "../components/molecules/vc-breadcrumbs/vc-breadcrumbs-model";
import { VcEditorProps, VcEditorSlots, VcEditorEmits } from "../components/molecules/vc-editor/vc-editor-model";
import {
  VcFileUploadProps,
  VcFileUploadSlots,
  VcFileUploadEmits,
} from "../components/molecules/vc-file-upload/vc-file-upload-model";
import {
  VcNotificationProps,
  VcNotificationSlots,
  VcNotificationEmits,
} from "../components/molecules/vc-notification/vc-notification-model";
import {
  VcPaginationProps,
  VcPaginationSlots,
  VcPaginationEmits,
} from "../components/molecules/vc-pagination/vc-pagination-model";
import { VcRatingProps, VcRatingSlots } from "../components/molecules/vc-rating/vc-rating-model";
import { VcSliderProps, VcSliderSlots } from "../components/molecules/vc-slider/vc-slider-model";
import {
  VcTextareaProps,
  VcTextareaSlots,
  VcTextareaEmits,
} from "../components/molecules/vc-textarea/vc-textarea-model";
import { VcAppProps, VcAppSlots, VcAppEmits } from "../components/organisms/vc-app/vc-app-model";
import { VcBladeProps, VcBladeSlots, VcBladeEmits } from "../components/organisms/vc-blade/vc-blade-model";
import {
  VcDynamicPropertyProps,
  VcDynamicPropertySlots,
} from "../components/organisms/vc-dynamic-property/vc-dynamic-property-model";
import { VcGalleryProps, VcGallerySlots, VcGalleryEmits } from "../components/organisms/vc-gallery/vc-gallery-model";
import { VcLoginFormProps, VcLoginFormSlots } from "../components/organisms/vc-login-form/vc-login-form-model";
import { VcPopupProps, VcPopupSlots, VcPopupEmits } from "../components/organisms/vc-popup/vc-popup-model";
import { VcTableProps, VcTableSlots, VcTableEmits } from "../components/organisms/vc-table/vc-table-model";
import { VcHintSlots } from "./../components/atoms/vc-hint/vc-hint-model";
import { VcFormSlots } from "./../components/molecules/vc-form/vc-form-model";

declare module "@vue/runtime-core" {
  interface GlobalComponents {
    // atoms
    VcBadge: GlobalComponentConstructor<VcBadgeProps, VcBadgeSlots, VcBadgeEmits>;
    VcButton: GlobalComponentConstructor<VcButtonProps, VcButtonSlots, VcButtonEmits>;
    VcCard: GlobalComponentConstructor<VcCardProps, VcCardSlots, VcCardEmits>;
    VcCheckbox: GlobalComponentConstructor<VcCheckboxProps, VcCheckboxSlots, VcCheckboxEmits>;
    VcCol: GlobalComponentConstructor<VcColProps, VcColSlots>;
    VcContainer: GlobalComponentConstructor<VcContainerProps, VcContainerSlots, VcContainerEmits>;
    VcHint: GlobalComponentConstructor<any, VcHintSlots>;
    VcIcon: GlobalComponentConstructor<VcIconProps, VcIconSlots>;
    VcImage: GlobalComponentConstructor<VcImageProps, VcImageSlots, VcImageEmits>;
    VcInfoRow: GlobalComponentConstructor<VcInfoRowProps, VcInfoRowSlots>;
    VcLabel: GlobalComponentConstructor<VcLabelProps, VcLabelSlots>;
    VcLink: GlobalComponentConstructor<VcLinkProps, VcLinkSlots, VcLinkEmits>;
    VcLoading: GlobalComponentConstructor<VcLoadingProps, VcLoadingSlots>;
    VcProgress: GlobalComponentConstructor<VcProgressProps, VcProgressSlots>;
    VcRow: GlobalComponentConstructor<any, VcRowSlots>;
    VcStatus: GlobalComponentConstructor<VcStatusProps, VcStatusSlots>;
    VcStatusIcon: GlobalComponentConstructor<VcStatusIconProps, VcStatusIconSlots>;
    VcSwitch: GlobalComponentConstructor<VcSwitchProps, VcSwitchSlots, VcSwitchEmits>;
    VcWidget: GlobalComponentConstructor<VcWidgetProps, VcWidgetSlots, VcWidgetEmits>;

    // molecules
    VcBreadcrumbs: GlobalComponentConstructor<VcBreadcrumbsProps, VcBreadcrumbsSlots>;
    VcEditor: GlobalComponentConstructor<VcEditorProps, VcEditorSlots, VcEditorEmits>;
    VcFileUpload: GlobalComponentConstructor<VcFileUploadProps, VcFileUploadSlots, VcFileUploadEmits>;
    VcForm: GlobalComponentConstructor<any, VcFormSlots>;
    VcInput: GlobalComponentConstructor<VcInputProps, VcInputSlots, VcInputEmits>;
    VcInputCurrency: GlobalComponentConstructor<VcInputCurrencyProps, VcInputCurrencySlots, VcInputCurrencyEmits>;
    VcNotification: GlobalComponentConstructor<VcNotificationProps, VcNotificationSlots, VcNotificationEmits>;
    VcPagination: GlobalComponentConstructor<VcPaginationProps, VcPaginationSlots, VcPaginationEmits>;
    VcRating: GlobalComponentConstructor<VcRatingProps, VcRatingSlots>;
    VcSelect: GlobalComponentConstructor<VcSelectProps, VcSelectSlots, VcSelectEmits>;
    VcSlider: GlobalComponentConstructor<VcSliderProps, VcSliderSlots>;
    VcTextarea: GlobalComponentConstructor<VcTextareaProps, VcTextareaSlots, VcTextareaEmits>;

    // organisms
    VcApp: GlobalComponentConstructor<VcAppProps, VcAppSlots, VcAppEmits>;
    VcBlade: GlobalComponentConstructor<VcBladeProps, VcBladeSlots, VcBladeEmits>;
    VcDynamicProperty: GlobalComponentConstructor<VcDynamicPropertyProps, VcDynamicPropertySlots>;
    VcGallery: GlobalComponentConstructor<VcGalleryProps, VcGallerySlots, VcGalleryEmits>;
    VcLoginForm: GlobalComponentConstructor<VcLoginFormProps, VcLoginFormSlots>;
    VcPopup: GlobalComponentConstructor<VcPopupProps, VcPopupSlots, VcPopupEmits>;
    VcTable: GlobalComponentConstructor<VcTableProps, VcTableSlots, VcTableEmits>;
  }
}

export {};
