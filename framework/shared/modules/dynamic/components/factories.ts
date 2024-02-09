import {
  IMultivalueField,
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
  IStatusField,
  IContentField,
  IVideoField,
  IImageField,
  ITextareaField,
  ISwitch,
  ITable,
  IRating,
} from "./../types/models";
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
  VcTextarea,
  VcMultivalue,
  VcSwitch,
  VcTable,
  VcRating,
} from "../../../../ui/components";

export const ControlBaseProps = ({
  rules = undefined,
  label = undefined,
  placeholder = undefined,
  disabled = false,
  required = false,
  name = undefined,
  tooltip = undefined,
  key = undefined,
  classNames = undefined,
  ...rest
}: IControlBaseProps): IControlBaseProps => ({
  key,
  rules,
  label,
  placeholder,
  disabled,
  required,
  name,
  tooltip,
  classNames,
  ...rest,
});

export const MultivalueField = ({ props, slots }: IMultivalueField): IMultivalueField => ({
  component: markRaw(VcMultivalue),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },

  slots,
});

export const SelectField = ({ props, slots }: ISelectField): ISelectField => ({
  component: markRaw(VcSelect) as any,
  props: {
    ...ControlBaseProps(props),
    ...props,
  },

  slots,
});

export const StatusField = ({ props, slots }: IStatusField): IStatusField => ({
  component: markRaw(VcStatus),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },

  slots,
});

export const InputField = ({ props, slots }: IInputField): IInputField => ({
  component: markRaw(VcInput),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },

  slots,
});

export const TextareaField = ({ props }: ITextareaField): ITextareaField => ({
  component: markRaw(VcTextarea),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
});

export const ContentField = ({ props }: IContentField): IContentField => ({
  component: markRaw(VcField),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
});

export const ImageField = ({ props }: IImageField): IImageField => ({
  component: markRaw(VcImage),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
});

export const VideoField = ({ props }: IInputField): IVideoField => ({
  component: markRaw(VcVideo),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
});

export const InputCurrency = ({ props }: IInputCurrency): IInputCurrency => ({
  component: markRaw(VcInputCurrency),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
});

export const CardCollection = ({ props, slots }: ICardCollection): ICardCollection => ({
  component: markRaw(VcCard),
  props: {
    ...props,
    ...ControlBaseProps(props),
  },

  slots,
});

export const DynamicProperties = ({ props }: IDynamicProperties): IDynamicProperties => ({
  component: markRaw(VcDynamicProperty),
  props: {
    ...props,
    ...ControlBaseProps(props),
  },
});

export const EditorField = ({ props }: IEditorField): IEditorField => ({
  component: markRaw(VcEditor),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
});

export const Gallery = ({ props }: IGallery): IGallery => ({
  component: markRaw(VcGallery),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
});

export const Checkbox = ({ props, slots }: ICheckbox): ICheckbox => ({
  component: markRaw(VcCheckbox),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },

  slots,
});

export const Button = ({ props, slots }: IButton): IButton => ({
  component: markRaw(VcButton),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },

  slots,
});

export const Switch = ({ props }: ISwitch): ISwitch => ({
  component: markRaw(VcSwitch),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
});

export const Fieldset = ({ columns, fields, property, remove }: IFieldset): IFieldset => ({
  columns,
  fields,
  property,
  remove,
});

export const Table = ({ props, slots }: ITable): ITable => ({
  component: markRaw(VcTable),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
  slots,
});

export const Rating = ({ props }: IRating): IRating => ({
  component: markRaw(VcRating),
  props: {
    ...ControlBaseProps(props),
    ...props,
  },
});
