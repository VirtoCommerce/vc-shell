<template>
  <render></render>
</template>

<script setup lang="ts">
import { VcButton, VcCol, VcRow, generateId } from "@vc-shell/framework";
import { Field } from "vee-validate";
import { Component, Fragment, Ref, computed, h, inject, mergeProps, reactive, unref } from "vue";
import { ControlType } from "./../models";
import * as _ from "lodash-es";

export interface Props {
  control: ControlType;
}

export interface Emits {
  (event: "update", data: any): void;
  (event: "call:method", data: { method; arg }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const isMobile = inject<Ref<boolean>>("isMobile");

const scope = computed((): ControlType & ReturnType<typeof createEventProps> => {
  return {
    ...unref(props.control),
    ...createEventProps(unref(props.control)),
  };
});

function render() {
  return (
    fieldsetRender(scope.value) ||
    fieldWithValidationRender(scope.value) ||
    fieldRecursiveRender(scope.value) ||
    fieldWithoutValidationRender(scope.value)
  );
}

function createEventProps(item: ControlType) {
  const args = {};

  if ("rawProperty" in item) args["property"] = item.rawProperty;
  if ("property" in item) args["name"] = item.property;
  if ("options" in item) args["dictionary"] = item.options;
  if ("context" in item) args["context"] = item.context;

  return {
    "onUpdate:modelValue": (e) => {
      emit("update", {
        value: e,
        ...args,
      });
    },
  };
}

function fieldRecursiveRender(scoped: ControlType) {
  if ("children" in scoped && Object.entries(scoped.children).length) {
    return h(
      scoped.component,
      { header: scoped.title, class: scoped.classNames, key: generateId() },
      {
        default: () =>
          h(
            "div",
            { class: "tw-p-2" },
            Object.entries(scoped.children).map(([, field]) => {
              if ("content" in field && unref(field.content) && Array.isArray(unref(field.content))) {
                return fieldsetRender(field);
              }

              if (typeof field === "object" && !Array.isArray(field) && "children" in field && field.children) {
                return fieldRecursiveRender(field);
              }

              return fieldWithoutValidationRender(field) || fieldWithValidationRender(field);
            })
          ),
        actions: () => {
          const elem = scoped.slots?.actions();
          if (elem) {
            return Object.entries(elem).map(([, field]) => {
              return fieldWithoutValidationRender(field);
            });
          }
          return undefined;
        },
      }
    );
  }
  return;
}

function fieldWithoutValidationRender(field: ControlType) {
  if (
    "component" in field &&
    field.component &&
    (!("rules" in field && field.rules) || ("noValidation" in field && field.noValidation))
  ) {
    const eventProps = createEventProps(field);
    const defaultComponentProps = unrefNested(field);

    return h(
      field.component as Component,
      {
        ...mergeProps(eventProps, defaultComponentProps),
        class: field.classNames,
      },
      "slots" in field && field.slots ? { ...field.slots } : {}
    );
  }

  return;
}

function fieldWithValidationRender(field: ControlType, rowQuantity?: number) {
  if (!("noValidation" in field) && "rules" in field && field.rules) {
    const eventProps = createEventProps(field);
    const defaultComponentProps = unrefNested(field);
    console.log(field);
    return h(
      Field,
      {
        name: rowQuantity > 1 ? field.name + generateId() : field.name,
        rules: unref(field.rules),
        modelValue: field.modelValue,
        label: unref(field.label),
      },
      {
        default: ({ errorMessage, errors, handleChange }) =>
          h(
            field.component as Component,
            {
              ...mergeProps(eventProps, defaultComponentProps, {
                "onUpdate:modelValue": (e) => {
                  handleChange(e);
                },
              }),
              error: !!errors.length,
              errorMessage,
              class: field.classNames,
            },
            "slots" in field && field.slots ? { ...field.slots } : {}
          ),
      }
    );
  }
  return;
}

function fieldsetRender(field: ControlType) {
  if ("content" in field) {
    const unreffedContent = unref(field.content);
    return unreffedContent.map(({ columns, fields, remove }, index) => {
      const divideByCols = _.chunk(Object.values(fields), columns || 1);
      return h(
        "div",
        divideByCols.map((itemsArr) => {
          return h(
            VcRow,
            {
              key: generateId(),
              class: {
                "tw-relative": true,
              },
            },
            () => [
              ...itemsArr.map((item) => {
                return h(
                  VcCol,
                  { key: generateId() },
                  () => fieldWithoutValidationRender(item) || fieldWithValidationRender(item, unreffedContent.length)
                );
              }),
              remove
                ? h(VcButton, {
                    iconSize: "m",
                    icon: "fas fa-times-circle",
                    text: true,
                    class: {
                      "tw-m-2": true,
                      "tw-absolute tw-top-0 tw-right-0": isMobile.value,
                    },
                    onClick: () => emit("call:method", { method: remove?.method, arg: index }),
                  })
                : undefined,
            ]
          );
        })
      );
    });
  }
  return;
}

function unrefNested(field) {
  const unreffedProps = {};

  Object.keys(field).forEach((key) => {
    unreffedProps[key] = unref(field[key]);
  });

  return unreffedProps;
}
</script>
