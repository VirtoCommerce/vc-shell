import { OverridesSchema } from "@vc-shell/framework";

export const overrides: OverridesSchema = {
  upsert: [
    {
      id: "OfferJ",
      path: "content[0].children[1].fields",
      index: 0,
      value: {
        id: "mockedInput",
        component: "vc-input",
        label: "Mocked input",
        property: "mockInputData",
      },
    },
  ],
};
