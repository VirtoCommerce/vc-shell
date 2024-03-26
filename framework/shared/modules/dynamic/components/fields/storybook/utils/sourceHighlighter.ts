import { sourceTransform } from "./sourceTransform";
import { highlight, languages } from "prismjs";
import "prismjs/themes/prism.css";
import { ControlSchema } from "../../../../types";

export const sourceHighlighter = async (
  args: ControlSchema,
  context: Record<string, unknown>,
  additionalSource: unknown,
) => {
  return createPrismEl(await sourceTransform(args, context, additionalSource));
};

function createPrismEl(state: string) {
  return highlight(state, languages.javascript, "javascript");
}
