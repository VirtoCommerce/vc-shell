/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from "lodash-es";

function setModel(args: {
  property: string;
  value: string | number | Record<string, any>;
  option?: string;
  context: Record<string, any>;
  scope?: Record<string, any>;
}) {
  const { property, value, option, context, scope } = args;

  if (scope && _.has(scope, property)) {
    if (typeof scope[property] === "function") {
      scope[property](value);
    } else {
      _.set(scope, property, value);
    }
    return;
  }
  _.set(context, property, option ? value[option as keyof typeof value] : value);
}

export { setModel };
