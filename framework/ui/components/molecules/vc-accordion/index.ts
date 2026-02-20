import _Accordion from "@ui/components/molecules/vc-accordion/vc-accordion.vue";
import _AccordionItem from "@ui/components/molecules/vc-accordion/_internal/vc-accordion-item/vc-accordion-item.vue";

export const VcAccordion = _Accordion as typeof _Accordion;
export const VcAccordionItem = _AccordionItem as typeof _AccordionItem;

export type { AccordionItem, Props as AccordionProps, Emits as AccordionEmits } from "@ui/components/molecules/vc-accordion/vc-accordion.vue";
export type {
  Props as AccordionItemProps,
  Emits as AccordionItemEmits,
} from "@ui/components/molecules/vc-accordion/_internal/vc-accordion-item/vc-accordion-item.vue";
