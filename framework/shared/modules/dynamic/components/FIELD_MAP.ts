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

const FIELD_MAP = {
  select: SelectField,
  card: Card,
  input: InputField,
  fieldset: Fieldset,
  "input-currency": InputCurrency,
  checkbox: Checkbox,
  "dynamic-properties": DynamicProperty,
  editor: EditorField,
  gallery: GalleryField,
  button: Button,
  status: StatusField,
};

export default FIELD_MAP;
