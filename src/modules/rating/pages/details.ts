import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    id: "ReviewDetails",
    component: "DynamicBladeForm",
    localizationPrefix: "RATING",
    composable: "useReview",
    status: {
      component: "ReviewStatus",
    },
    width: "30%",
  },
  content: [
    {
      id: "reviewForm",
      component: "vc-form",
      children: [
        {
          id: "createdFieldset",
          component: "vc-fieldset",
          columns: 2,
          fields: [
            {
              id: "createdByField",
              component: "vc-field",
              label: "RATING.PAGES.DETAILS.FORM.CREATED_BY.LABEL",
              property: "createdBy",
            },
            {
              id: "createdDateField",
              component: "vc-field",
              label: "RATING.PAGES.DETAILS.FORM.CREATED_DATE.LABEL",
              property: "createdDate",
            },
          ],
        },
        {
          id: "reviewTitle",
          component: "vc-field",
          label: "RATING.PAGES.DETAILS.FORM.TITLE.LABEL",
          property: "title",
        },
        {
          id: "rating",
          component: "vc-rating",
          property: "rating",
          label: "RATING.PAGES.DETAILS.FORM.RATING.LABEL",
          placeholder: "RATING.PAGES.DETAILS.FORM.RATING.PLACEHOLDER",
        },
        {
          id: "reviewTextarea",
          component: "vc-textarea",
          property: "review",
          label: "RATING.PAGES.DETAILS.FORM.REVIEW.LABEL",
          placeholder: "RATING.PAGES.DETAILS.FORM.REVIEW.PLACEHOLDER",
          disabled: {
            method: "disableReviewTextarea",
          },
        },
      ],
    },
  ],
};
