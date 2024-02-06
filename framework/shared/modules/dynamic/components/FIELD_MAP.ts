import SelectField from "./fields/SelectField";
import Card from "./fields/Card";
import InputField from "./fields/InputField";
import Fieldset from "./fields/Fieldset";
import InputCurrency from "./fields/InputCurrency";
import Checkbox from "./fields/Checkbox";
import DynamicProperty from "./fields/DynamicProperty";
import EditorField from "./fields/EditorField";
import GalleryField from "./fields/GalleryField";
import Button from "./fields/Button";
import StatusField from "./fields/StatusField";
import ContentField from "./fields/ContentField";
import VideoField from "./fields/VideoField";
import ImageField from "./fields/ImageField";
import TextareaField from "./fields/TextareaField";
import MultivalueField from "./fields/MultivalueField";
import SwitchField from "./fields/SwitchField";
import Table from "./fields/Table";

import { ControlSchema } from "../types";
import CustomComponent from "./fields/CustomComponent";
import RatingField from "./fields/RatingField";

type AvailableComponents = Exclude<ControlSchema["component"], "vc-widgets">;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFieldMap = Record<AvailableComponents, any>;

const FIELD_MAP: TFieldMap = {
  "vc-select": SelectField,
  "vc-card": Card,
  "vc-input": InputField,
  "vc-fieldset": Fieldset,
  "vc-input-currency": InputCurrency,
  "vc-checkbox": Checkbox,
  "vc-dynamic-properties": DynamicProperty,
  "vc-editor": EditorField,
  "vc-gallery": GalleryField,
  "vc-button": Button,
  "vc-status": StatusField,
  "vc-field": ContentField,
  "vc-video": VideoField,
  "vc-image": ImageField,
  "vc-textarea": TextareaField,
  "vc-multivalue": MultivalueField,
  "vc-switch": SwitchField,
  "vc-table": Table,
  "vc-custom": CustomComponent,
  "vc-rating": RatingField,
};

export default FIELD_MAP;
