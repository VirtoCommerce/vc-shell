import * as parserTypeScript from "prettier/parser-typescript";
import * as prettier from "prettier/standalone";
// eslint-disable-next-line import/namespace
import * as prettierPluginEstree from "prettier/plugins/estree";
import serialize from "serialize-javascript";
import { ControlSchema } from "../../../../types";

export const sourceTransform = async (
  args: ControlSchema,
  context: Record<string, unknown>,
  additionalSource: unknown,
) => {
  let source: string = "";

  if (args) {
    source += `
    \nconst ComponentSchema = ${serialize(args, { space: 2 })}`;
  }

  if (context && Object.keys(context).length > 0) {
    source += `
    \nconst ComposableScope = ${serialize(context, { unsafe: true, space: 2 })}`;
  }

  if (additionalSource) {
    source += `
    \nconst Context = ${serialize(additionalSource, { unsafe: true, space: 2 })}`;
  }

  return await formatCode(source);
};

const formatCode = async (src: string) => {
  const options = {
    parser: "typescript",
    singleQuote: true,
    plugins: [parserTypeScript, prettierPluginEstree] as (string | { [key: string]: any })[],
    tabWidth: 2,
  };
  return await prettier.format(src, options);
};
