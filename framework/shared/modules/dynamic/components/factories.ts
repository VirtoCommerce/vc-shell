/* eslint-disable @typescript-eslint/no-explicit-any */
import { markRaw } from "vue";
import {
  VcButton,
  VcCard,
  VcCheckbox,
  VcDynamicProperty,
  VcEditor,
  VcField,
  VcGallery,
  VcImage,
  VcInput,
  VcInputCurrency,
  VcSelect,
  VcStatus,
  VcVideo,
} from "../../../../ui/components";
import {
  IControlBaseProps,
  ISelectField,
  IInputField,
  ICardCollection,
  IEditorField,
  IGallery,
  IDynamicProperties,
  ICheckbox,
  IButton,
  IInputCurrency,
  IFieldset,
  IControlBaseOptions,
  IStatusField,
  IContentField,
  IVideoField,
  IImageField,
} from "../types/models";

export const ControlBase = ({ visibility = undefined }: IControlBaseOptions): IControlBaseOptions => ({
  visibility,
});

export const ControlBaseProps = ({
  rules = undefined,
  label = undefined,
  placeholder = undefined,
  disabled = false,
  required = false,
  name = undefined,
  classNames = undefined,
  tooltip = undefined,
  key = undefined,
  ...rest
}: IControlBaseProps): IControlBaseProps => ({
  key,
  rules,
  label,
  placeholder,
  disabled,
  required,
  name,
  classNames,
  tooltip,
  ...rest,
});

export const SelectField = ({ props, slots, options }: Partial<ISelectField>): ISelectField => ({
  component: markRaw(VcSelect) as any,
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  options: ControlBase(options),
  slots,
});

export const StatusField = ({ props, slots, options }: Partial<IStatusField>): IStatusField => ({
  component: markRaw(VcStatus),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  options: ControlBase(options),
  slots,
});

export const InputField = ({ props, options, slots }: Partial<IInputField>): IInputField => ({
  component: markRaw(VcInput),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  options: ControlBase(options),
  slots,
});

export const ContentField = ({ props, options }: Partial<IContentField>): IContentField => ({
  component: markRaw(VcField),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  options: ControlBase(options),
});

export const ImageField = ({ props, options }: Partial<IImageField>): IImageField => ({
  component: markRaw(VcImage),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  options: ControlBase(options),
});

export const VideoField = ({ props, options }: Partial<IInputField>): IVideoField => ({
  component: markRaw(VcVideo),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  options: ControlBase(options),
});

export const InputCurrency = ({ props, options }: Partial<IInputCurrency>): IInputCurrency => ({
  component: markRaw(VcInputCurrency),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  options: ControlBase(options),
});

export const CardCollection = ({ props, options, slots }: Partial<ICardCollection>): ICardCollection => ({
  component: markRaw(VcCard),
  props: {
    ...props,
    ...ControlBaseProps(props),
  },
  options: ControlBase(options),
  slots,
});

export const DynamicProperties = ({ props, options }: Partial<IDynamicProperties>): IDynamicProperties => ({
  component: markRaw(VcDynamicProperty),
  props: {
    ...props,
    ...ControlBaseProps(props),
  },
  options: ControlBase(options),
});

export const EditorField = ({ props, options }: Partial<IEditorField>): IEditorField => ({
  component: markRaw(VcEditor),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  options: ControlBase(options),
});

export const Gallery = ({ props, options }: Partial<IGallery>): IGallery => ({
  component: markRaw(VcGallery),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  options: ControlBase(options),
});

export const Checkbox = ({ props, options, slots }: Partial<ICheckbox>): ICheckbox => ({
  component: markRaw(VcCheckbox),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  options: ControlBase(options),
  slots,
});

export const Button = ({ props, options, slots }: Partial<IButton>): IButton => ({
  component: markRaw(VcButton),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  options: ControlBase(options),
  slots,
});

export const Fieldset = ({ columns, fields, property, remove }: IFieldset): IFieldset => ({
  columns,
  fields,
  property,
  remove,
});
