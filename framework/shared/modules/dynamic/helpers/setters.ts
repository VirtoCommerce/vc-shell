/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from "lodash-es";
import { unrefNested } from "./unrefNested";

function setModel(args: {
  property: string;
  value: string | number | Record<string, any>;
  option?: string;
  context: Record<string, any>;
  scope?: Record<string, any>;
}) {
  const { property, value, option, context, scope } = args;

  if (_.has(unrefNested(context), property)) {
    _.set(context, property, option ? value[option as keyof typeof value] : value);
  } else if (scope && _.has(scope, property)) {
    if (typeof scope[property] === "function") {
      scope[property](value);
    } else {
      _.set(scope, property, value);
    }
  }
}

export { setModel };
