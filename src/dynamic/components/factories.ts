/* eslint-disable @typescript-eslint/no-explicit-any */
import { markRaw, shallowReactive } from "vue";
import {
  VcButton,
  VcCard,
  VcCheckbox,
  VcDynamicProperty,
  VcEditor,
  VcGallery,
  VcInput,
  VcInputCurrency,
  VcSelect,
} from "@vc-shell/framework";
import {
  IControlBase,
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
} from "./models";

export const ControlBase = ({
  rules = undefined,
  label = undefined,
  placeholder = undefined,
  disabled = false,
  required = false,
  name = undefined,
  context = undefined,
  classNames = undefined,
  rawProperty = undefined,
}: IControlBase): IControlBase => ({
  rules,
  label,
  placeholder,
  disabled,
  required,
  name,
  context,
  classNames,
  rawProperty,
});

export const SelectField = ({
  options = [],
  optionValue,
  optionLabel,
  emitValue,
  modelValue,
  slots,
  ...rest
}: Partial<ISelectField>): ISelectField =>
  shallowReactive({
    ...ControlBase(rest),
    component: markRaw(VcSelect),
    options,
    optionValue,
    optionLabel,
    emitValue,
    modelValue,
    slots,
  });

export const InputField = ({ modelValue, type, ...rest }: Partial<IInputField>): IInputField =>
  shallowReactive({
    ...ControlBase(rest),
    component: markRaw(VcInput),
    modelValue,
    type,
  });

export const InputCurrency = ({
  modelValue,
  option,
  options,
  optionValue,
  optionLabel,
  ...rest
}: Partial<IInputCurrency>): IInputCurrency =>
  shallowReactive({
    ...ControlBase(rest),
    component: markRaw(VcInputCurrency),
    modelValue,
    options,
    option,
    optionValue,
    optionLabel,
  });

export const CardCollection = ({ children, title, slots, ...rest }: Partial<ICardCollection>): ICardCollection => ({
  ...ControlBase(rest),
  component: markRaw(VcCard),
  title,
  children,
  slots,
});

export const DynamicProperties = ({
  modelValue,
  optionsGetter,
  property,
  required,
  multivalue,
  valueType,
  dictionary,
  name,
  optionsValue,
  optionsLabel,
  displayNames,
  rules,
  disabled,
  ...rest
}: Partial<IDynamicProperties>): IDynamicProperties =>
  shallowReactive({
    component: markRaw(VcDynamicProperty),
    property,
    required,
    multivalue,
    valueType,
    dictionary,
    name,
    optionsValue,
    optionsLabel,
    displayNames,
    rules,
    disabled,
    modelValue,
    optionsGetter,
    noValidation: true,
    ...rest,
  });

export const EditorField = ({ modelValue, assetsFolder, name, ...rest }: Partial<IEditorField>): IEditorField =>
  shallowReactive({
    ...ControlBase(rest),
    component: markRaw(VcEditor),
    modelValue,
    assetsFolder,
    name,
  });

export const Gallery = ({
  images,
  multiple,
  onUpload,
  onSort,
  onEdit,
  onRemove,
  ...rest
}: Partial<IGallery>): IGallery =>
  shallowReactive({
    ...ControlBase(rest),
    component: markRaw(VcGallery),
    images,
    modelValue: images,
    multiple,
    onUpload,
    onSort,
    onEdit,
    onRemove,
  });

export const Checkbox = ({ modelValue, slots, trueValue, falseValue, ...rest }: Partial<ICheckbox>): ICheckbox =>
  shallowReactive({
    ...ControlBase(rest),
    component: markRaw(VcCheckbox),
    modelValue,
    slots,
    trueValue,
    falseValue,
  });

export const Button = ({ small, slots, icon, iconSize, text, onClick }: Partial<IButton>): IButton =>
  shallowReactive({
    component: markRaw(VcButton),
    small,
    slots,
    icon,
    iconSize,
    text,
    onClick,
    noValidation: true,
  });

export const Fieldset = ({ content }: IFieldset): IFieldset => shallowReactive({ content });
