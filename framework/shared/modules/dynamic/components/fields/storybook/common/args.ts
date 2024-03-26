export const SchemaBaseArgTypes = {
  id: {
    description: "Unique identifier for component.",
    control: "text",
    type: {
      required: true,
      name: "string",
    },
    table: {
      type: {
        summary: "string",
      },
    },
  },
  label: {
    description: `Control label.
      To show label based on some bound property - use interpolation \`{}\` syntax.
      \n\`@example\` {someProperty}
      Supports i18n keys.`,
    control: "text",
    table: {
      type: {
        summary: "string",
      },
    },
  },
  property: {
    description: `Property name to populate the component with data.
    Data can be defined in either the \`item\` or the \`scope\`.
    \nDot notation can also be used for nested properties, e.g. \`address.city\` or \`addresses[1].city\`.
    \nYou can also use a \`function\` or \`writable computed\` to set the property in the \`scope\`, which receives the modified data as an argument.
    `,
    type: {
      required: true,
      name: "string",
    },
    table: {
      type: {
        summary: "string",
      },
    },
  },
  rules: {
    description: `Vee-validate and custom validation rules for the schema.`,
    control: "object",
    table: {
      type: {
        summary: "IValidationRules",
        detail:
          "https://github.com/VirtoCommerce/vc-shell/blob/67ac3849b35660680123efaf59775d4a64a210f6/framework/core/types/index.ts#L10",
      },
    },
  },
  placeholder: {
    description: `Placeholder text for the component.
    Supports i18n keys.`,
    control: "text",
    table: {
      type: {
        summary: "string",
      },
    },
  },
  disabled: {
    description: `Disabled state for component.
    Method should be defined in the blade \`scope\`.
    Method should return boolean value.
    `,
    table: {
      type: {
        summary: "{ method: string }",
      },
    },
  },
  tooltip: {
    description: `Tooltip text for the component.
    Supports i18n keys.`,
    control: "text",
    table: {
      type: {
        summary: "string",
      },
    },
  },
  visibility: {
    description: `Visibility options for component.
    Method should be defined in the blade \`scope\`.
    Method should return boolean value.
    `,
    table: {
      type: {
        summary: "{ method: string }",
      },
    },
  },
  multilanguage: {
    description: "Flag to indicate if the component supports multilanguage.",
    control: "boolean",
    table: {
      type: {
        summary: "boolean",
      },
      defaultValue: {
        summary: "false",
      },
    },
  },
  update: {
    description: `Additional method that is called when the modelValue of the component changes.
    Method should be defined in the blade \`scope\`.
    `,
    table: {
      type: {
        summary: "{ method: string }",
      },
    },
  },
  horizontalSeparator: {
    description: `Adds horizontal separator after component.`,
    control: "boolean",
    table: {
      type: {
        summary: "boolean",
      },
      defaultValue: {
        summary: "false",
      },
    },
  },
} as const;
