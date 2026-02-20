import SelectField from "@shared/modules/dynamic/components/fields/SelectField";
import Card from "@shared/modules/dynamic/components/fields/Card";
import InputField from "@shared/modules/dynamic/components/fields/InputField";
import Fieldset from "@shared/modules/dynamic/components/fields/Fieldset";
import InputCurrency from "@shared/modules/dynamic/components/fields/InputCurrency";
import Checkbox from "@shared/modules/dynamic/components/fields/Checkbox";
import DynamicProperty from "@shared/modules/dynamic/components/fields/DynamicProperty";
import EditorField from "@shared/modules/dynamic/components/fields/EditorField";
import GalleryField from "@shared/modules/dynamic/components/fields/GalleryField";
import Button from "@shared/modules/dynamic/components/fields/Button";
import StatusField from "@shared/modules/dynamic/components/fields/StatusField";
import ContentField from "@shared/modules/dynamic/components/fields/ContentField";
import VideoField from "@shared/modules/dynamic/components/fields/VideoField";
import ImageField from "@shared/modules/dynamic/components/fields/ImageField";
import TextareaField from "@shared/modules/dynamic/components/fields/TextareaField";
import MultivalueField from "@shared/modules/dynamic/components/fields/MultivalueField";
import SwitchField from "@shared/modules/dynamic/components/fields/SwitchField";
import Table from "@shared/modules/dynamic/components/fields/Table";

import { ControlSchema } from "@shared/modules/dynamic/types";
import CustomComponent from "@shared/modules/dynamic/components/fields/CustomComponent";
import RatingField from "@shared/modules/dynamic/components/fields/RatingField";
import RadioButtonGroup from "@shared/modules/dynamic/components/fields/RadioButtonGroup";

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
  "vc-radio-button-group": RadioButtonGroup,
};

export default FIELD_MAP;
