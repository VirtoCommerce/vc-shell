/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from "lodash-es";

function setModel(args: {
  property: string;
  value: string | number | Record<string, any>;
  option?: string;
  context: Record<string, any>;
}) {
  const { property, value, option, context } = args;

  _.set(context, property, option ? value[option] : value);
}

export { setModel };
